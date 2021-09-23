import * as path from 'path';
import { npath, ppath, xfs } from '@yarnpkg/fslib';
import * as execa from 'execa';
import * as gitP from 'simple-git/promise';
import {
  YARN_RC_YARN_PATH,
  YARN_RELEASE_FILE_PATH,
  YARN_WORKSPACE_TOOLS_RELEASE_FILE_PATH,
  YARN_RC_WORKSPACE_TOOLS_PATH,
  YARN_RC_WORKSPACE_SINCE_BUNDLE_PATH,
  YARN_WORKSPACE_SINCE_BUNDLE_FILE_PATH,
} from './constants';
import { Sema } from 'async-sema';

export interface Repository {
  git: gitP.SimpleGit;
  dir: string;
  addPackage: (name: string) => Promise<Package>;
  install: () => Promise<void>;
  commitAll: (msg: string) => Promise<gitP.CommitResult>;
  cleanup: () => Promise<void>;
  exec: (cmd: string, args: string[]) => execa.ExecaChildProcess<string>;
}

export async function initializeTestRepository(): Promise<Repository> {
  const repoDir = await xfs.mktempPromise();

  const git = await gitP(repoDir);
  const installSema = new Sema(1);

  await Promise.all([git.init(), initializeYarn(repoDir)]);

  await commitAll('Initial commit');

  return {
    git,
    dir: repoDir,
    addPackage: async (name: string) => {
      const pkg = await initializeWorkspacePackage(repoDir, name, `packages/${name}`);

      await install();

      return pkg;
    },
    install,
    commitAll,
    cleanup: async () => {
      xfs.detachTemp(repoDir);
    },
    exec: (cmd: string, args: string[]) => execa(cmd, args, { cwd: repoDir }),
  };

  async function commitAll(msg: string) {
    await git.add('--all');
    const commit = await git.commit(msg);

    return commit;
  }

  async function install() {
    try {
      await installSema.acquire();

      await execa('yarn', ['install'], { cwd: repoDir });
    } finally {
      installSema.release();
    }
  }
}

async function initializeYarn(repoDir: string) {
  return Promise.all([createPackageJSON(repoDir), setupYarnBinary(repoDir)]);
}

async function createPackageJSON(repoDir: string) {
  const targetPath = npath.toPortablePath(path.join(repoDir, 'package.json'));
  const content = JSON.stringify({
    name: 'test-repo',
    private: true,
    workspaces: ['packages/*'],
  });

  await xfs.mkdirpPromise(ppath.dirname(targetPath));

  return xfs.writeFilePromise(targetPath, content);
}

async function setupYarnBinary(repoDir: string) {
  /**
   * .yarn/releases에 있는 Yarn 바이너리 파일 복사
   */
  const originalYarnBinaryPath = npath.toPortablePath(YARN_RELEASE_FILE_PATH);
  const targetYarnBinaryPath = npath.toPortablePath(path.join(repoDir, YARN_RC_YARN_PATH));

  /**
   * .yarn/plugins에 있는 Yarn Workspace Tools 바이너리 파일 복사
   */
  const originalYarnWorkspaceToolsPath = npath.toPortablePath(
    YARN_WORKSPACE_TOOLS_RELEASE_FILE_PATH,
  );
  const targetYarnWorkspaceToolsPath = npath.toPortablePath(
    path.join(repoDir, YARN_RC_WORKSPACE_TOOLS_PATH),
  );

  /**
   * bundles에 있는 Yarn Workspace Since 번들 복사
   */
  const originalYarnSincePath = npath.toPortablePath(YARN_WORKSPACE_SINCE_BUNDLE_FILE_PATH);
  const targetYarnSincePath = npath.toPortablePath(
    path.join(repoDir, YARN_RC_WORKSPACE_SINCE_BUNDLE_PATH),
  );

  /**
   * .yarnrc.yml에서 위에서 복사한 Yarn 바이너리 파일을 사용하도록 설정
   */
  const targetYarnRCPath = npath.toPortablePath(path.join(repoDir, '.yarnrc.yml'));
  const yarnRCContent = [
    `yarnPath: '${YARN_RC_YARN_PATH}'`,
    '',
    'plugins:',
    `  - ./${YARN_RC_WORKSPACE_SINCE_BUNDLE_PATH}`,
    `  - path: ${YARN_RC_WORKSPACE_TOOLS_PATH}`,
    '    spec: "@yarnpkg/plugin-workspace-tools"',
  ].join('\n');

  /**
   * 디렉토리의 존재성을 보장
   */
  await Promise.all([
    xfs.mkdirpPromise(ppath.dirname(targetYarnBinaryPath)),
    xfs.mkdirpPromise(ppath.dirname(targetYarnRCPath)),
    xfs.mkdirpPromise(ppath.dirname(targetYarnWorkspaceToolsPath)),
    xfs.mkdirpPromise(ppath.dirname(targetYarnSincePath)),
  ]);

  return Promise.all([
    xfs.copyFilePromise(originalYarnBinaryPath, targetYarnBinaryPath),
    xfs.writeFilePromise(targetYarnRCPath, yarnRCContent),
    xfs.copyFilePromise(originalYarnWorkspaceToolsPath, targetYarnWorkspaceToolsPath),
    xfs.copyFilePromise(originalYarnSincePath, targetYarnSincePath),
  ]);
}

export interface Package {
  name: string;
  path: string;
  addFile: (filePath: string, content: string | Buffer) => Promise<void>;
}

/**
 * `repoDir`로 주어진 Yarn Berry Workspace에 `name` 이름을 가지는 테스트용 패키지를 추가합니다.
 */
async function initializeWorkspacePackage(
  repoDir: string,
  name: string,
  packagePath: string,
): Promise<Package> {
  const targetPath = npath.toPortablePath(path.join(repoDir, packagePath, 'package.json'));
  const content = JSON.stringify({
    name,
    private: true,
  });

  await xfs.mkdirpPromise(ppath.dirname(targetPath));
  await xfs.writeFilePromise(targetPath, content);

  return {
    name,
    path: packagePath,
    addFile: async (filePath: string, content: string | Buffer) => {
      const targetPath = npath.toPortablePath(path.join(repoDir, packagePath, filePath));

      await xfs.mkdirpPromise(ppath.dirname(targetPath));
      return await xfs.writeFilePromise(targetPath, content);
    },
  };
}
