import { getUpdatedPackages } from '@tossteam/updated-packages';
import distinct from './distinct';
import getDependentWorkspace from './getDependentWorkspace';
import getWorkspacesList from '../Workspace/getWorkspacesList';
import { readPackageJson } from '../readPackageJson';

export default async function getUpdatedWorkspaces({ from, to }: { from: string; to: string }) {
  const { workspaces } = await readPackageJson();

  const updatedWorkspace = (
    await getUpdatedPackages(process.cwd(), {
      from,
      to,
      workspaces: workspaces as string[],
    })
  ).filter(pkg => pkg !== `.`);

  if (updatedWorkspace.length === 0) {
    return [];
  }

  const allWorkspaces = await getWorkspacesList();
  const allLocations = allWorkspaces.map(v => v.location);

  return distinct([
    ...updatedWorkspace,
    ...updatedWorkspace.flatMap(workspace => {
      return getDependentWorkspace({
        dependency: workspace,
        allWorkspaces,
      }).map(v => v.location);
    }),
  ]).filter(location => {
    return allLocations.includes(location);
  });
}
