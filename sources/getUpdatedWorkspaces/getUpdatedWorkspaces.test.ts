import { initializeTestRepository } from '../../testing/repository';
import getUpdatedWorkspaces from './getUpdatedWorkspaces';

describe('getUpdatedWorkspaces', () => {
  it('Workspace 내부의 업데이트된 패키지 리스트를 반환한다', async () => {
    const repository = await initializeTestRepository();

    try {
      const [package1, package2, package3] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
        repository.addPackage('package3'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      await package1.addFile('package1.ts', '"I am updated"');
      await package2.addFile('package2.ts', '"I am updated"');

      const afterCommit = await repository.commitAll('Update package1 and package2');
      const afterCommitSha = afterCommit.commit;

      const updatedWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        workspaceDir: repository.dir,
      });

      expect(updatedWorkspaces).toEqual([package1.path, package2.path]);

      expect(updatedWorkspaces).not.toContain(package3.path);
    } finally {
      repository.cleanup();
    }
  });

  it('한글을 포함하는 경로의 파일이 업데이트된 경우에도 정상적으로 동작한다', async () => {
    const repository = await initializeTestRepository();

    try {
      const [package1, package2] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      await package1.addFile('가나다/package1.ts', '"I am updated"');

      const afterCommit = await repository.commitAll('Update package1');
      const afterCommitSha = afterCommit.commit;

      const updatedWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        workspaceDir: repository.dir,
      });

      expect(updatedWorkspaces).toEqual([package1.path]);

      expect(updatedWorkspaces).not.toContain(package2.path);
    } finally {
      repository.cleanup();
    }
  });

  it('workspaces 가 glob이 아닌 경우, ignore 한다.', async () => {
    const repository = await initializeTestRepository();

    const ignoreGlob = 'packages/package2';

    try {
      const [package1, package2] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      await package1.addFile('가나다/package1.ts', '"I am updated"');

      await package2.addFile('가나다/package2.ts', '"I am updated"');

      const afterCommit = await repository.commitAll('Update package1 & package2');
      const afterCommitSha = afterCommit.commit;

      const updatedWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        ignore: ignoreGlob,
        workspaceDir: repository.dir,
      });

      expect(updatedWorkspaces).toEqual([package1.path]);

      expect(updatedWorkspaces).not.toContain(package2.path);
    } finally {
      repository.cleanup();
    }
  });

  it('workspaces가 glob인 경우, ignore 한다.', async () => {
    const repository = await initializeTestRepository();

    const ignoreGlob = '*/package2';

    try {
      const [package1, package2] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      await package1.addFile('가나다/package1.ts', '"I am updated"');

      await package2.addFile('가나다/package2.ts', '"I am updated"');

      const afterCommit = await repository.commitAll('Update package1 & package2');
      const afterCommitSha = afterCommit.commit;

      const updatedWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        ignore: ignoreGlob,
        workspaceDir: repository.dir,
      });

      expect(updatedWorkspaces).toEqual([package1.path]);

      expect(updatedWorkspaces).not.toContain(package2.path);
    } finally {
      repository.cleanup();
    }
  });
  it('workspaces가 glob가 아닌 경우, ignore 한다.', async () => {
    const repository = await initializeTestRepository({}, [
      'packages/package1',
      'packages/package2',
    ]);

    const ignoreGlob = '*/package2';

    try {
      const [package1, package2] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      await package1.addFile('가나다/package1.ts', '"I am updated"');

      await package2.addFile('가나다/package2.ts', '"I am updated"');

      const afterCommit = await repository.commitAll('Update package1 & package2');
      const afterCommitSha = afterCommit.commit;

      const updatedWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        ignore: ignoreGlob,
        workspaceDir: repository.dir,
      });

      expect(updatedWorkspaces).toEqual([package1.path]);

      expect(updatedWorkspaces).not.toContain(package2.path);
    } finally {
      repository.cleanup();
    }
  });

  it('sub directory에 yarn이 설치된 경우에도 정상적으로 동작한다.', async () => {
    const repository = await initializeTestRepository();

    try {
      const [mainPkg1, mainPkg2] = await Promise.all([
        repository.addPackage('package1'),
        repository.addPackage('package2'),
      ]);

      const subYarnDir = await repository.addSubYarn('sub-yarn');

      const [subPkg1, subPkg2] = await Promise.all([
        subYarnDir.addPackage('package1'),
        subYarnDir.addPackage('package2'),
      ]);

      const beforeCommit = await repository.commitAll('Add packages');
      const beforeCommitSha = beforeCommit.commit;

      await mainPkg1.addFile('가나다/package1.ts', '"I am updated"');
      await subPkg1.addFile('가나다/package1.ts', '"I am updated"');

      const afterCommit = await repository.commitAll('Update package1');
      const afterCommitSha = afterCommit.commit;

      const updatedRepositoryWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        workspaceDir: repository.dir,
      });

      const updatedSubWorkspaces = await getUpdatedWorkspaces({
        from: beforeCommitSha,
        to: afterCommitSha,
        workspaceDir: subYarnDir.dir,
      });

      expect(updatedRepositoryWorkspaces).toEqual([mainPkg1.path]);
      expect(updatedRepositoryWorkspaces).not.toContain(mainPkg2.path);

      expect(updatedSubWorkspaces).toEqual([subPkg1.path]);
      expect(updatedSubWorkspaces).not.toContain(subPkg2.path);
    } finally {
      repository.cleanup();
    }
  });
});
