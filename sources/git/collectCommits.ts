import * as fs from 'fs';
import { log, readCommit, resolveRef } from 'isomorphic-git';

const MS_IN_A_SECOND = 1000;

const workingDir = process.cwd();

export async function collectCommits(from: string, to: string) {
  const [fromRef, toRef] = await Promise.all([
    resolveRef({ fs, dir: workingDir, ref: from }),
    resolveRef({ fs, dir: workingDir, ref: to }),
  ]);

  const fromCommit = await readCommit({
    fs,
    dir: workingDir,
    oid: fromRef,
  });

  const since = new Date(fromCommit.commit.author.timestamp * MS_IN_A_SECOND);

  return (
    await log({
      fs,
      dir: workingDir,
      ref: toRef,
      since,
    })
  ).map(v => v.commit);
}
