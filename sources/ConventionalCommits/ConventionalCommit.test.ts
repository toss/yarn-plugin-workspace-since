import { git } from 'faker';
import { Level, parseConventionalCommit, sumLevel } from './ConventionalCommit';

describe('ConventionalCommit/parseConventionalCommit', () => {
  describe(`메시지에 scope가 없는 경우`, () => {
    it(`scope로 "null"을 돌려준다`, () => {
      const { scope } = parseConventionalCommit(`chore: ${git.commitMessage()}`);
      expect(scope).toBeNull();
    });

    it(`chore: 결과로 "none" level을 돌려준다`, () => {
      const { level } = parseConventionalCommit(`chore: ${git.commitMessage()}`);
      expect(level).toBe(Level.none);
    });

    it(`fix: 결과로 "patch" level을 돌려준다`, () => {
      const { level } = parseConventionalCommit(`fix: ${git.commitMessage()}`);
      expect(level).toBe(Level.patch);
    });

    it(`feat: 결과로 "minor" level을 돌려준다`, () => {
      const { level } = parseConventionalCommit(`feat: ${git.commitMessage()}`);
      expect(level).toBe(Level.minor);
    });

    it(`BREAKING CHANGE: 결과로 "major" level을 돌려준다`, () => {
      const { level } = parseConventionalCommit(`BREAKING CHANGE: ${git.commitMessage()}`);
      expect(level).toBe(Level.major);
    });
  });

  describe(`scope가 있는 경우`, () => {
    it(`scope로 지정한 scope를 돌려준다`, () => {
      const givenScope = `@some-scope/utils`;

      const { scope } = parseConventionalCommit(`feat(${givenScope}): ${git.commitMessage()}`);

      expect(scope).toBe(givenScope);
    });
  });

  it(`앞에 "*" 캐릭터가 있어도 잘 파싱된다`, () => {
    const { level } = parseConventionalCommit(`* fix: ${git.commitMessage()}`);
    expect(level).toBe(Level.patch);
  });

  it(`Conventional Commit에 맞지 않는 메시지는 error를 throw한다`, () => {
    const commitMessage = `Hello, world!`;

    expect(() => parseConventionalCommit(commitMessage)).toThrowError(
      `Invalid commit message: ${commitMessage}`,
    );
  });
});

describe(`ConventionalCommit/sumLevel`, () => {
  const testCases: Array<[[Level, Level], Level]> = [
    [[Level.none, Level.none], Level.none],
    [[Level.none, Level.major], Level.major],
    [[Level.patch, Level.minor], Level.minor],
    [[Level.minor, Level.patch], Level.minor],
    [[Level.minor, Level.none], Level.minor],
    [[Level.minor, Level.major], Level.major],
  ];

  for (const [args, result] of testCases) {
    test(`sumLevel(${args[0]}, ${args[1]}) === ${result}`, () => {
      expect(sumLevel(args[0], args[1])).toBe(result);
    });
  }
});
