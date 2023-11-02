import execa from 'execa';

export async function getUpdatedFiles({
  from,
  to,
  cwd = process.cwd(),
}: {
  from: string;
  to: string;
  cwd?: string;
}) {
  const { stdout } = await execa(
    'git',
    ['-c', 'core.quotepath=false', 'diff', '--name-only', `${from}...${to}`],
    {
      cwd,
      shell: true,
    },
  );

  return stdout.split(`\n`);
}
