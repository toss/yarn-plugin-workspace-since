import { matchWorkspacesByFiles } from './matchWorkspacesByFiles';

describe('matchWorkspacesByFiles', () => {
  it('nested workspace의 파일이 상위 workspace가 아닌 정확한 workspace에 매핑된다', () => {
    const matched = matchWorkspacesByFiles({
      workspaces: ['services/root', 'services/root/nested'],
      files: ['services/root/root-case.ts', 'services/root/nested/nested-case.ts']
    });

    expect(matched).toEqual(['services/root', 'services/root/nested']);
  });
  
  it('주어진 파일을 기반으로 변경된 워크스페이스를 찾는다', () => {
    const matched = matchWorkspacesByFiles({
      workspaces: [`services/foo`, `services/bar`],
      files: [`services/foo/a.ts`, `some-unknown-file.txt`],
    });

    expect(matched).toEqual([`services/foo`]);
  });
});
