import * as minimatch from 'minimatch';
import * as execa from 'execa';
import distinct from './distinct';
import getDependentWorkspace from './getDependentWorkspace';
import getWorkspacesList from '../Workspace/getWorkspacesList';
import { PackageJson } from '../PackageJson';
import { matchWorkspacesByFiles } from './matchWorkspacesByFiles';

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

  const { stdout } = await execa.command(`git diff --name-only ${from}...${to}`, {
    cwd: process.cwd(),
    shell: true,
  });
  const updatedFiles = stdout.split(`\n`);

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
