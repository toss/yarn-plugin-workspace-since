export const Level = {
  none: `none`,
  patch: `patch`,
  minor: `minor`,
  major: `major`,
} as const;

export type Level = keyof typeof Level;

export interface ParsedConventionalCommit {
  level: Level;
  scope: string | null;
}

const regex = /(chore|fix|feat|BREAKING CHANGE)\(?([^\).]*)\)?:/;

export function parseConventionalCommit(message: string): ParsedConventionalCommit {
  const parsedMessage = regex.exec(message);

  if (parsedMessage == null) {
    throw new Error(`Invalid commit message: ${message}`);
  }

  const [, type, parsedScope] = parsedMessage;
  const scope = parsedScope !== `` ? parsedScope : null;

  switch (type) {
    case `fix`:
      return {
        level: Level.patch,
        scope,
      };
    case `feat`:
      return {
        level: Level.minor,
        scope,
      };
    case `BREAKING CHANGE`:
      return {
        level: Level.major,
        scope,
      };
    default:
      return {
        level: Level.none,
        scope,
      };
  }
}

const prioritiesOfLevel: Record<Level, number> = {
  [Level.none]: 0,
  [Level.patch]: 1,
  [Level.minor]: 2,
  [Level.major]: 3,
};

export function sumLevel(a: Level, b: Level) {
  if (prioritiesOfLevel[a] > prioritiesOfLevel[b]) {
    return a;
  } else {
    return b;
  }
}
