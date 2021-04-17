import { random, git } from 'faker';
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
      [scope]: `minor`,
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
      [scope1]: `none`,
      [scope2]: `major`,
    });
  });

  it('conventional commit이 아닌 커밋이 포함되어 있어도 잘 동작한다', () => {
    const scope = getRandomScope();

    const commits = [
      `chore(${scope}): ${git.commitMessage()}`,
      git.commitMessage(),
      `* feat(${scope}): ${git.commitMessage()}`,
      git.commitMessage(),
    ];

    const result = reduceConventionalCommits(commits);

    expect(result).toEqual({
      [scope]: `minor`,
    });
  });
});

// all인경우 포현 어떻게함?
// scope 없는 경우 개무시하기?
// publish는 어떻게함? since로 함?
// package name만 받아올 수 있는데.. location은 어쩜? 왜냐면 location이랑 package name은 다르기 때문에..
// getLocationByPackageName('@tosspayments/async-boundary')?
// 라이브러리만 배포해야하는데 이것은 어떡하나?
// 그것은 사실 여기서 해결할 문제는 아니다.

/**
 * 'major'
 */
