import * as execa from 'execa';
import { CommitResult } from 'simple-git/promise';
import { initializeTestRepository, Package, Repository } from '../../testing/repository';

/**
 * yarn build로 timeout되는 것을 방지
 */
jest.setTimeout(20000);

describe('ListCommand', () => {
  let repository: Repository;
  let packages: [Package, Package, Package];
  let initialCommit: CommitResult;
  beforeAll(async () => {
    await execa('yarn', ['build']);
  });
  beforeEach(async () => {
    repository = await initializeTestRepository();
    packages = await Promise.all([
      repository.addPackage('package1'),
      repository.addPackage('package2'),
      repository.addPackage('package3'),
    ]);
    initialCommit = await repository.commitAll('Add packages');
  });
  afterEach(async () => {
    repository.cleanup();
  });
  describe('yarn workspaces since list <from>', () => {
    it('모든 workspace에 변경사항이 없으면 아무 것도 출력하지 않는다.', async () => {
      await repository.commitAll('Empty commit');

      const result = await repository.exec('yarn', [
        'workspaces',
        'since',
        'list',
        initialCommit.commit,
      ]);

      expect(result.stdout).toBe('');
    });
    it('변경된 workspace가 있다면 해당 workspace들을 순서대로 출력한다', async () => {
      const [package1, package2] = packages;

      await Promise.all([
        package1.addFile('package1.ts', '"I am updated"'),
        package2.addFile('package2.ts', '"I am updated"'),
      ]);

      await repository.commitAll('Update package1 and package2');

      const result = await repository.exec('yarn', [
        'workspaces',
        'since',
        'list',
        initialCommit.commit,
      ]);

      expect(result.stdout).toBe('packages/package1\npackages/package2');
    });
  });
});
