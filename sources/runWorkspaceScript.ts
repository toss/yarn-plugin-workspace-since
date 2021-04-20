import * as execa from 'execa';
import { Writable } from 'stream';

export default async function runWorkspaceScript({
  workspacePath,
  workspaceName,
  script,
  stdout,
  stderr,
}: {
  workspaceName: string;
  workspacePath: string;
  script: string;
  stdout: Writable;
  stderr: Writable;
}) {
  try {
    stdout.write(`📦  [${workspaceName}] yarn ${script} 를 실행합니다.\n`);

    await execa(`yarn`, script.split(' '), {
      cwd: workspacePath,
      buffer: true,
    });

    stdout.write(`✅  [${workspaceName}] yarn ${script} 실행이 완료되었습니다.\n`);
  } catch (err: unknown) {
    if (!isExecaError(err)) {
      throw err;
    }

    if (err.stdout.includes(`Usage Error: Couldn't find a script named`)) {
      stdout.write(
        `⚠️  [${workspaceName}] "${script}" 명령어를 찾을 수 없습니다. 실행을 건너 뜁니다.\n`,
      );
      return;
    }

    stderr.write(`❌  [${workspaceName}] "${script}" 실행에 실패했습니다.\n${err.stdout}`);
    throw err;
  }
}

function isExecaError(error: unknown): error is execa.ExecaError {
  return (error as execa.ExecaError).isCanceled != null;
}
