import minimatch from 'minimatch';
import distinct from './distinct';
import getDependentWorkspace from './getDependentWorkspace';
import getWorkspacesList from '../Workspace/getWorkspacesList';
import { PackageJson } from '../PackageJson';
import { matchWorkspacesByFiles } from './matchWorkspacesByFiles';
import { getUpdatedFiles } from './getUpdatedFiles';

export default async function getUpdatedWorkspaces({
  from,
  to,
  ignore = '',
  workspaceDir = '.',
}: {
  from: string;
  to: string;
  ignore?: string;
  workspaceDir?: string;
}) {
  const allWorkspaces = await getWorkspacesList({ cwd: workspaceDir });
  const allLocations = allWorkspaces.map(v => v.location);

  const targetWorkspaces = allLocations.filter(location => {
    return PackageJson(workspaceDir).workspaces.some(glob => {
      return minimatch(location, glob) && !minimatch(location, ignore);
    });
  });

  const updatedFiles = await getUpdatedFiles({ from, to, cwd: workspaceDir });

  const updatedWorkspaces = matchWorkspacesByFiles({
    workspaces: targetWorkspaces,
    files: updatedFiles,
  });

  if (updatedWorkspaces.length === 0) {
    return [];
  }

  return distinct([
    ...updatedWorkspaces,
    ...updatedWorkspaces.flatMap(workspace => {
      return getDependentWorkspace({
        dependency: workspace,
        allWorkspaces,
      }).map(v => v.location);
    }),
  ]).filter(location => {
    return allLocations.includes(location);
  });
}
