import * as path from 'path';
import * as execa from 'execa';
import { readJson } from 'fs-extra';
import { Readable, Writable } from 'stream';

export default async function runWorkspaceScript({
  workspacePath,
  workspaceName,
  scripts,
  stdout,
  stdin,
  stderr
}: {
  workspaceName: string;
  workspacePath: string;
  scripts: string[];
  stdout: Writable;
  stdin: Readable;
  stderr: Writable;
}) {
  const packageJson = await readJson(path.resolve(workspacePath, 'package.json'));
  
  for (const script of scripts) {
    if (packageJson.scripts?.[script] == null) {
      stdout.write(
        `⚠️  ${workspaceName}에 ${script} 명령어가 정의되어 있지 않아 실행하지 않습니다.\n`
      );
      return;
    }
  
    stdout.write(`📦  [${workspaceName}] yarn ${script} 를 실행합니다.\n`);
  
    // FIXME: arguments를 받지 못하는 문제가 있습니다(e.g. Command failed with exit code 1: yarn jest --help)
    // arguments를 받을 수 있도록 고쳐서 정의된 명령어 외의 명령어로 사용할 수 있게 변경해야 합니다.
    await execa(`yarn`, [script], {
      cwd: workspacePath,
      stdout,
      stdin,
      stderr
    });
  
    stdout.write(`✅  [${workspaceName}] yarn ${script} 실행이 완료되었습니다.\n`);
  }
}
