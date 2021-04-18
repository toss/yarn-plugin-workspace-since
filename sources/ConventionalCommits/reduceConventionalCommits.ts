import { Level, parseConventionalCommit, sumLevel } from './ConventionalCommit';

export function reduceConventionalCommits(messages: string[]) {
  return messages.reduce((ret, message) => {
    try {
      const { scope, level } = parseConventionalCommit(message);

      if (scope == null) {
        return ret;
      }

      ret[scope] = sumLevel(level, ret[scope] ?? Level.none);

      return ret;
    } catch (err) {
      if (err.message.includes(`Invalid commit message`)) {
        // parseConventionalCommit의 에러는 무시한다.
        return ret;
      }

      throw err;
    }
  }, {} as Record<string, Level>);
}
