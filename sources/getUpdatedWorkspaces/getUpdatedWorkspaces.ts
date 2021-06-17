import * as minimatch from 'minimatch';
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
}: {
  from: string;
  to: string;
  ignore?: string;
}) {
  const matchedWorkspaceGlobs = PackageJson('.').workspaces.filter(v => !minimatch(v, ignore));

  const allWorkspaces = await getWorkspacesList();
  const allLocations = allWorkspaces.map(v => v.location);

  const targetWorkspaces = allLocations.filter(location => {
    return matchedWorkspaceGlobs.some(glob => minimatch(location, glob));
  });

  const updatedFiles = await getUpdatedFiles({ from, to });

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
