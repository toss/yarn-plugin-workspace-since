import { matchWorkspacesByFiles } from './matchWorkspacesByFiles';

describe('matchWorkspacesByFiles', () => {
  it('주어진 파일을 기반으로 변경된 워크스페이스를 찾는다', () => {
    const matched = matchWorkspacesByFiles({
      workspaces: [`services/foo`, `services/bar`],
      files: [`services/foo/a.ts`, `some-unknown-file.txt`],
    });

    expect(matched).toEqual([`services/foo`]);
  });
});
