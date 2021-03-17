import getWorkspacesList from './getWorkspacesList';

describe('getWorkspacesList', () => {
  it(`루트는 포함하지 않는다`, async () => {
    const ROOT = `.`;
    const workspaces = await getWorkspacesList();
    const locations = workspaces.map(work => work.location);

    expect(locations).not.toContain(ROOT);
  });
});
