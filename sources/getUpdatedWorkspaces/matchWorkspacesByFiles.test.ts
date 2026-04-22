import { matchWorkspacesByFiles } from './matchWorkspacesByFiles';

describe('matchWorkspacesByFiles', () => {  
  it('주어진 파일을 기반으로 변경된 워크스페이스를 찾는다', () => {
    const matched = matchWorkspacesByFiles({
      workspaces: [`services/foo`, `services/bar`],
      files: [`services/foo/a.ts`, `some-unknown-file.txt`],
    });

    expect(matched).toEqual([`services/foo`]);
  });

  it('하나의 파일이 2개 이상의 워크스페이스에 매핑되면 에러를 발생시킨다', () => {
    expect(() =>
      matchWorkspacesByFiles({
        workspaces: [`services/root`, `services/root/nested`],
        files: [`services/root/root-case.ts`, `services/root/nested/nested-case.ts`],
      }),
    ).toThrow();
  });
});
