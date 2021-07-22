import WorkspaceEntry from '../Workspace/WorkspaceEntry';

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
  dependency,
}: GetDependentWorkSpaceParams): WorkspaceEntry[] {
  const calculatedDependencies = new Set<string>();

  function _getDependentWorkspaces({ allWorkspaces, dependency }: GetDependentWorkSpaceParams) {
    if (calculatedDependencies.has(dependency)) {
      return [];
    }

    calculatedDependencies.add(dependency);

    const directDependents = getDirectDependentWorkspaces({ allWorkspaces, dependency });

    if (directDependents.length === 0) {
      return [];
    }
  
    return [
      ...directDependents,
      ...directDependents.flatMap(dependent => {
        return _getDependentWorkspaces({
          allWorkspaces,
          dependency: dependent.location,
        });
      }),
    ];
  }

  return _getDependentWorkspaces({ allWorkspaces, dependency })
}
