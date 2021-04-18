import getDependentWorkspace from './getDependentWorkspace';
import WorkspaceEntry from '../Workspace/WorkspaceEntry';

describe('getDependentWorkspace', () => {
  const libraryA: WorkspaceEntry = {
    location: `libraries/a`,
    name: `@libraries/a`,
    workspaceDependencies: [],
    mismatchedWorkspaceDependencies: [],
  };

  const libraryB: WorkspaceEntry = {
    location: `libraries/b`,
    name: `@libraries/b`,
    workspaceDependencies: [libraryA.location],
    mismatchedWorkspaceDependencies: [],
  };

  const serviceA: WorkspaceEntry = {
    location: `services/a`,
    name: `@services/a`,
    workspaceDependencies: [libraryA.location],
    mismatchedWorkspaceDependencies: [],
  };

  const serviceB: WorkspaceEntry = {
    location: `services/b`,
    name: `@services/b`,
    workspaceDependencies: [libraryB.location],
    mismatchedWorkspaceDependencies: [],
  };

  it('주어진 워크스페이스에 의존하고 있는 다른 워크스페이스 목록을 배열로 리턴한다', () => {
    const packages = getDependentWorkspace({
      allWorkspaces: [serviceA, libraryA],
      dependency: libraryA.location,
    });

    expect(packages).toHaveLength(1);
    expect(packages[0]).toEqual(serviceA);
  });

  it(`주어진 워크스페이스에 간접적으로 의존하는 워크스페이스 목록도 리턴한다`, () => {
    const packages = getDependentWorkspace({
      allWorkspaces: [serviceB, libraryA, libraryB],
      dependency: libraryA.location,
    });

    expect(packages).toContainEqual(serviceB);
  });
});
