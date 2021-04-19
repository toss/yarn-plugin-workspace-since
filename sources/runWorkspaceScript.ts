import * as execa from 'execa';
import { Readable, Writable } from 'stream';

export default async function runWorkspaceScript({
  workspacePath,
  workspaceName,
  script,
  stdout,
  stdin,
  stderr,
  ignoreErrors,
}: {
  workspaceName: string;
  workspacePath: string;
  script: string;
  stdout: Writable;
  stdin: Readable;
  stderr: Writable;
  ignoreErrors: boolean;
}) {
  try {
    stdout.write(`📦  [${workspaceName}] yarn ${script} 를 실행합니다.\n`);

    await execa(`yarn`, script.split(' '), {
      cwd: workspacePath,
      stdout,
      stdin,
      stderr,
    });

    stdout.write(`✅  [${workspaceName}] yarn ${script} 실행이 완료되었습니다.\n`);
  } catch (err) {
    if (ignoreErrors) {
      stdout.write(`⚠️  [${workspaceName}] yarn ${script} 실행 중 에러가 발생했습니다.\n`);
      return;
    }

    throw err;
  }
}
