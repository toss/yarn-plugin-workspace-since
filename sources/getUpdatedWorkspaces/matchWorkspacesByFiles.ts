export function matchWorkspacesByFiles({
  workspaces,
  files,
}: {
  workspaces: string[];
  files: string[];
}): string[] {
  return files
    .map(file => {
      return workspaces.find(workspace => file.startsWith(workspace));
    })
    .filter(v => v != null);
}
