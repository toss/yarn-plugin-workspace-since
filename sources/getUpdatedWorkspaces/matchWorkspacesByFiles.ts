export function matchWorkspacesByFiles({
  workspaces,
  files,
}: {
  workspaces: string[];
  files: string[];
}): string[] {
  return files
    .map(file => {
      const matchedWorkspaces = workspaces.filter(workspace => file.startsWith(`${workspace}/`));

      if (matchedWorkspaces.length > 1) {
        throw new Error('Nested workspaces are not supported');
      }

      return matchedWorkspaces[0];
    })
    .filter(v => v != null);
}
