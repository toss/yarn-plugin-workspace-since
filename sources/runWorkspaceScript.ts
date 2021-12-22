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
  const commandString = script.startsWith(`yarn`) ? script : `yarn ${script}`;

  try {
    stdout.write(`📦  [${workspaceName}] ${commandString} 명령어를 실행합니다.\n`);

    const { stdout: execaStdout, stderr: execaStderr } = await execa.command(commandString, {
      cwd: workspacePath,
      buffer: true,
      shell: true,
    });

    stdout.write(
      [
        `✅  [${workspaceName}] ${commandString} 실행이 완료되었습니다.`,
        `----------STDOUT----------`,
        execaStdout,
        ...(execaStderr !== '' ? [`----------STDERR----------`, execaStderr] : []),
        `\n`,
      ].join(`\n`),
    );
  } catch (err: unknown) {
    if (!isExecaError(err)) {
      throw err;
    }

    if (err.stdout.includes(`Usage Error: Couldn't find a script named`)) {
      stdout.write(
        `⚠️  [${workspaceName}] "${commandString}" 명령어를 찾을 수 없습니다. 실행을 건너 뜁니다.\n`,
      );
      return;
    }

    stderr.write(
      [
        `❌  [${workspaceName}] "${commandString}" 실행에 실패했습니다.`,
        `----------STDOUT----------`,
        err.stdout,
        `----------STDERR----------`,
        err.stderr,
        `\n`,
      ].join(`\n`),
    );
    throw err;
  }
}

function isExecaError(error: unknown): error is execa.ExecaError {
  return (error as execa.ExecaError).isCanceled != null;
}
