import { random, git } from 'faker';
import { Level } from './ConventionalCommit';
import { reduceConventionalCommits } from './reduceConventionalCommits';

function getRandomScope() {
  return `${random.word().toLowerCase()}-${random.word().toLowerCase()}`;
}

describe('reduceConventionalCommits', () => {
  it('여러 커밋들로부터 하나의 commit level을 계산한다', () => {
    const scope = getRandomScope();
    const commits = [
      `feat(${scope}): ${git.commitMessage()}`,
      `fix(${scope}): ${git.commitMessage()}`,
    ];

    const result = reduceConventionalCommits(commits);

    expect(result).toEqual({
      [scope]: Level.minor,
    });
  });

  it('여러 scope에 대해서도 적절한 commit level을 계산한다', () => {
    const scope1 = getRandomScope();
    const scope2 = getRandomScope();

    const commits = [
      `chore(${scope1}): ${git.commitMessage()}`,
      `* BREAKING CHANGE(${scope2}): ${git.commitMessage()}`,
      `* feat(${scope2}): ${git.commitMessage()}`,
      `* chore(${scope1}): ${git.commitMessage()}`,
    ];

    const result = reduceConventionalCommits(commits);

    expect(result).toEqual({
      [scope1]: Level.none,
      [scope2]: Level.major,
    });
  });

  it('conventional commit이 아닌 커밋은 무시한다', () => {
    const scope = getRandomScope();

    const commits = [
      `chore(${scope}): ${git.commitMessage()}`,
      git.commitMessage(),
      `* feat(${scope}): ${git.commitMessage()}`,
      git.commitMessage(),
    ];

    const result = reduceConventionalCommits(commits);

    expect(result).toEqual({
      [scope]: Level.minor,
    });
  });

  it(`scope가 존재하지 않는 커밋은 무시한다`, () => {
    const commits = [`chore: ${git.commitMessage()}`, `feat: ${git.commitMessage()}`];

    const result = reduceConventionalCommits(commits);

    expect(result).toEqual({});
  });
});
