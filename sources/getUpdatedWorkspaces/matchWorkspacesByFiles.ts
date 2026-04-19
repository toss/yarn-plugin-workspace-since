export function matchWorkspacesByFiles({
  workspaces,
  files,
}: {
  workspaces: string[];
  files: string[];
}): string[] {
  const sortedWorkspaces = [...workspaces].sort((a, b) => b.length - a.length);
  
  return files
    .map(file => {
      return sortedWorkspaces.find(workspace => file.startsWith(`${workspace}/`));
    })
    .filter(v => v != null);
}
