import getWorkspacesList from './getWorkspacesList';

describe('getWorkspacesList', () => {
  it('workspace 목록과 각 workspace 별로 가지고 있는 dependency를 반환한다', async () => {
    const workspaces = await getWorkspacesList();

    expect(workspaces).toEqual(expect.any(Array));

    workspaces.forEach(workspace => {
      expect(workspace.location).toEqual(expect.any(String));
      expect(workspace.workspaceDependencies).toEqual(expect.any(Array));
    });
  });
});
