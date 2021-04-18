import { CommandContext } from '@yarnpkg/core';
import { Command } from 'clipanion';
import * as fs from 'fs';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import { parse } from 'semver';
import { Level } from '../ConventionalCommits/ConventionalCommit';
import { reduceConventionalCommits } from '../ConventionalCommits/reduceConventionalCommits';
import { readPackageJson } from '../readPackageJson';
import getWorkspacesList from '../Workspace/getWorkspacesList';
import * as minimatch from 'minimatch';
import { log, readCommit, resolveRef } from 'isomorphic-git';

class VersionCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: `변경된 패키지에 대해 Semantic Versioning을 자동으로 실행합니다.`,
    details: `
      from으로 부터 to까지 반영된 커밋들을 읽어들입니다.
      읽어들인 커밋 메시지를 Conventional Commits 기준에 따라 해석하고 이에 따라 다음 패키지 버전을 결정합니다.
    `,
    examples: [
      [
        `ci/main 태그와 HEAD 사이에 있는 커밋에 따라 업데이트된 패키지들에 대해 Semantic Version Bump`,
        `yarn workspaces since version ci/main`,
      ],
    ],
  });

  @Command.String({ required: true, name: `from` })
  from: string;

  @Command.String({ required: false, name: `to` })
  to = 'HEAD';

  @Command.String('--exclude')
  exclude: string = '';

  @Command.Path(`workspaces`, `since`, `version`)
  async execute() {
    const from = await resolveRef({
      fs,
      dir: process.cwd(),
      ref: this.from,
    });
    const fromCommit = await readCommit({
      fs,
      dir: process.cwd(),
      oid: from,
    });
    const to = await resolveRef({
      fs,
      dir: process.cwd(),
      ref: this.to,
    });

    const since = new Date(fromCommit.commit.author.timestamp * 1000); // ms로 변환필요

    const commits = await log({
      fs,
      dir: process.cwd(),
      ref: to,
      since,
    });

    const messages = commits.flatMap(v => v.commit.message.split(`\n`)).filter(v => v !== '');

    const updatedPackages = reduceConventionalCommits(messages);

    const workspaces = await getWorkspacesList();

    for (const [pkgName, level] of Object.entries(updatedPackages)) {
      if (level === Level.none) {
        break;
      }

      const workspace = workspaces.find(v => v.name === pkgName);

      if (workspace == null) {
        break;
      }

      const shouldExclude = minimatch(workspace.location, this.exclude);

      if (shouldExclude) {
        break;
      }

      const pkgJson = await readPackageJson(`/${workspace.location}`);
      const prevVersion = pkgJson.version!;

      const semver = parse(prevVersion);
      semver.inc(level);
      pkgJson.version = semver.version;

      await writeFile(
        path.resolve(process.cwd(), workspace.location, `package.json`),
        `${JSON.stringify(pkgJson, null, 2)}\n`,
      );

      this.context.stdout.write(
        `ℹ️  ${pkgName}의 버전이 변경되었습니다: ${prevVersion} ➡️  ${semver.version}\n`,
      );
    }
  }
}

export default VersionCommand;
