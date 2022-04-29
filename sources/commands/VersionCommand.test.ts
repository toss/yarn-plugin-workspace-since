import { initializeTestRepository } from '../../testing/repository';

describe(`VersionCommand`, () => {
  describe(`yarn workspaces since version <from>`, () => {
    it(`커밋 메시지의 scope에 해당하는 이름을 가진 패키지의 버전을 변경한다`, async () => {
      const repository = await initializeTestRepository(['libraries']);

      try {
        const pkg = await repository.addPackage('@tossteam/package', {
          path: 'libraries/package',
          version: `1.0.0`,
        });

        const packageCommit = await repository.commitAll('Add packages');

        await pkg.addFile('file.ts', '"I am updated"');

        await repository.commitAll(`feat(${pkg.name}): Update package`);

        await repository.exec('yarn', ['workspaces', 'since', 'version', packageCommit.commit]);

        const updatedVersion = await pkg.getVersion();

        expect(updatedVersion).toBe(`1.1.0`);
      } finally {
        await repository.cleanup();
      }
    });
  });
});
