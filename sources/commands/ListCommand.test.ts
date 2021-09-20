import * as execa from 'execa';
import { initializeTestRepository } from '../../testing/repository';

jest.setTimeout(20000);

describe('ListCommand는', () => {
  beforeAll(async () => {
    await execa('yarn', ['build']);
  });
  it('모든 workspace에 변경사항이 없으면 아무 것도 출력하지 않는다.', async () => {
    const repository = await initializeTestRepository();
    try {
      const [package1, package2, package3] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
        repository.addPackage('package3'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      const afterCommit = await repository.commitAll('Empty commit');
      const afterCommitSha = afterCommit.commit;

      const result = await repository.exec('yarn', [
        'workspaces',
        'since',
        'list',
        beforeCommitSha,
      ]);

      expect(result.stdout).toBe('');
    } finally {
      repository.cleanup();
    }
  });
});
