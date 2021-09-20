import { CommitResult } from 'simple-git/promise';
import { initializeTestRepository, Package, Repository } from '../../testing/repository';

describe('ListCommand', () => {
  let repository: Repository;
  let packages: [Package, Package, Package];
  let initialCommit: CommitResult;

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
    await repository.cleanup();
  });

  describe('yarn workspaces since list <from>', () => {
    it('모든 package에 변경사항이 없으면 아무 것도 출력하지 않는다', async () => {
      await repository.commitAll('Empty commit');

      const result = await repository.exec('yarn', [
        'workspaces',
        'since',
        'list',
        initialCommit.commit,
      ]);

      expect(result.stdout).toBe('');
    });
    it('변경된 package가 있다면 해당 package들을 출력한다', async () => {
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

      const updatedPackages = result.stdout.split('\n');
      expect(updatedPackages).toContain('packages/package1');
      expect(updatedPackages).toContain('packages/package2');
    });
  });

  describe('yarn workspaces since list <from> <to>', () => {
    let firstCommit: CommitResult;
    let secondCommit: CommitResult;

    beforeEach(async () => {
      const [package1, package2, package3] = packages;

      await Promise.all([
        package1.addFile('package1.ts', '"I am updated"'),
        package2.addFile('package2.ts', '"I am updated"'),
      ]);

      firstCommit = await repository.commitAll('Update package1 and package2');

      await Promise.all([
        package2.addFile('package2.tsx', '"I am updated"'),
        package3.addFile('package3.tsx', '"I am updated"'),
      ]);

      secondCommit = await repository.commitAll('Update package2 and package3');
    });

    it('<to>까지 변경된 package들을 출력한다 1', async () => {
      const result = await repository.exec('yarn', [
        'workspaces',
        'since',
        'list',
        initialCommit.commit,
        firstCommit.commit,
      ]);

      const updatedPackages = result.stdout.split('\n');
      expect(updatedPackages).toContain('packages/package1');
      expect(updatedPackages).toContain('packages/package2');
    });
    it('<to>까지 변경된 package들을 출력한다 2', async () => {
      const result = await repository.exec('yarn', [
        'workspaces',
        'since',
        'list',
        initialCommit.commit,
        secondCommit.commit,
      ]);

      const updatedPackages = result.stdout.split('\n');
      expect(updatedPackages).toContain('packages/package1');
      expect(updatedPackages).toContain('packages/package2');
      expect(updatedPackages).toContain('packages/package3');
    });
  });
});
