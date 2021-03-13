import WorkspaceEntry from './WorkspaceEntry';

interface GetDependentWorkSpaceParams {
  allWorkspaces: WorkspaceEntry[];
  dependency: string;
}

function getDirectDependentWorkspaces({ allWorkspaces, dependency }: GetDependentWorkSpaceParams) {
  return allWorkspaces.filter(pkg => {
    return pkg.workspaceDependencies.includes(dependency);
  });
}

export default function getDependentWorkspace({
  allWorkspaces,
  dependency
}: GetDependentWorkSpaceParams): WorkspaceEntry[] {
  const directDependents = getDirectDependentWorkspaces({ allWorkspaces, dependency });

  if (directDependents.length === 0) {
    return [];
  }

  return [
    ...directDependents,
    ...directDependents.flatMap(dependent => {
      return getDependentWorkspace({
        allWorkspaces,
        dependency: dependent.location
      });
    })
  ];
}
