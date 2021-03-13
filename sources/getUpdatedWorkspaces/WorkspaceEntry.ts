export default interface WorkspaceEntry {
  location: string; // 디렉토리 위치
  name: string; // package.json에 기록되어있는 이름
  workspaceDependencies: string[]; // 다른 패키지에 대한 dependency (name이 아닌 location의 배열)
  mismatchedWorkspaceDependencies: string[];
}
