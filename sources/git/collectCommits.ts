import execa from 'execa';

export async function collectCommits(from: string, to: string) {
  const [fromSha, toSha] = await Promise.all([resolveRef(from), resolveRef(to)]);
  return log(fromSha, toSha);
}

async function resolveRef(ref: string) {
  const { stdout } = await execa(`git`, [`rev-parse`, ref], {
    cwd: process.cwd(),
    shell: true,
  });

  return stdout;
}

async function log(from: string, to: string) {
  const delimiter = `___SINCE_DELIMITER___`;
  const { stdout } = await execa(
    `git`,
    [`log`, `${from}..${to}`, `--pretty=format:"%H${delimiter}%s"`],
    {
      cwd: process.cwd(),
      shell: true,
    },
  );

  return stdout.split(`\n`).map(commits => {
    const [sha, message] = commits.split(delimiter);
    return { sha, message };
  });
}
