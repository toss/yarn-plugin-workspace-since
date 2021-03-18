import * as path from 'path';
import * as execa from 'execa';
import { readJson } from 'fs-extra';
import { Readable, Writable } from 'stream';

export default async function runWorkspaceScript({
  workspacePath,
  workspaceName,
  script,
  stdout,
  stdin,
  stderr
}: {
  workspaceName: string;
  workspacePath: string;
  script: string;
  stdout: Writable;
  stdin: Readable;
  stderr: Writable;
}) {
  const packageJson = await readJson(path.resolve(workspacePath, 'package.json'));

  if (packageJson.scripts?.[script] == null) {
    stdout.write(
      `⚠️  ${workspaceName}에 ${script} 명령어가 정의되어 있지 않아 실행하지 않습니다.\n`
    );
    return;
  }

  stdout.write(`📦  [${workspaceName}] yarn ${script} 를 실행합니다.\n`);

  await execa(`yarn`, [script], {
    cwd: workspacePath,
    stdout,
    stdin,
    stderr
  });

  stdout.write(`✅  [${workspaceName}] yarn ${script} 실행이 완료되었습니다.\n`);
}
