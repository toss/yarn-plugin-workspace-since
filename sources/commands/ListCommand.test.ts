import { initializeTestRepository } from '../../testing/repository';

async function setup() {
  const repository = await initializeTestRepository();
  const packages = await Promise.all([
    repository.addPackage('package1'),
    repository.addPackage('package2'),
    repository.addPackage('package3'),
  ]);
  const initialCommit = await repository.commitAll('Add packages');
  return {
    repository,
    packages,
    initialCommit,
  };
}

describe('ListCommand', () => {
  describe('yarn workspaces since list <from>', () => {
    it('모든 package에 변경사항이 없으면 아무 것도 출력하지 않는다', async () => {
      const { repository, initialCommit } = await setup();
      try {
        await repository.commitAll('Empty commit');

        const result = await repository.exec('yarn', [
          'workspaces',
          'since',
          'list',
          initialCommit.commit,
        ]);

        expect(result.stdout).toBe('');
      } finally {
        await repository.cleanup();
      }
    });
    it('변경된 package가 있다면 해당 package들을 출력한다', async () => {
      const {
        repository,
        initialCommit,
        packages: [package1, package2],
      } = await setup();

      try {
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
      } finally {
        await repository.cleanup();
      }
    });
  });

  describe('yarn workspaces since list <from> <to>', () => {
    async function setupTestCommits() {
      const setupResult = await setup();
      const {
        repository,
        packages: [package1, package2, package3],
      } = setupResult;

      await Promise.all([
        package1.addFile('package1.ts', '"I am updated"'),
        package2.addFile('package2.ts', '"I am updated"'),
      ]);

      const firstCommit = await repository.commitAll('Update package1 and package2');

      await Promise.all([
        package2.addFile('package2.tsx', '"I am updated"'),
        package3.addFile('package3.tsx', '"I am updated"'),
      ]);

      const secondCommit = await repository.commitAll('Update package2 and package3');

      return { ...setupResult, firstCommit, secondCommit };
    }

    it('<to>까지 변경된 package들을 출력한다 1', async () => {
      const { repository, initialCommit, firstCommit } = await setupTestCommits();
      try {
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
      } finally {
        await repository.cleanup();
      }
    });
    it('<to>까지 변경된 package들을 출력한다 2', async () => {
      const { repository, initialCommit, secondCommit } = await setupTestCommits();
      try {
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
      } finally {
        await repository.cleanup();
      }
    });
  });
});
