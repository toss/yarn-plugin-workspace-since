import * as execa from 'execa';

export async function getUpdatedFiles({ from, to }: { from: string; to: string }) {
  const { stdout } = await execa.command(`git diff --name-only ${from}...${to}`, {
    cwd: process.cwd(),
    shell: true,
  });

  return stdout.split(`\n`);
}
