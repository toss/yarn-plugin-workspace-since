import { getUpdatedPackages } from '@tossteam/updated-packages';
import { readFile } from 'fs-extra';
import distinct from './distinct';
import getDependentWorkspace from './getDependentWorkspace';
import getWorkspacesList from './getWorkspacesList';

export default async function getUpdatedWorkspaces({ from, to }: { from: string; to: string }) {
  const workingDir = process.cwd();
  const { workspaces } = JSON.parse(await readFile(`${workingDir}/package.json`, 'utf8'));

  const updatedWorkspace = (
    await getUpdatedPackages(process.cwd(), {
      from,
      to,
      workspaces: workspaces
    })
  ).filter(pkg => pkg !== `.`);

  if (updatedWorkspace.length === 0) {
    return [];
  }

  const allWorkspaces = await getWorkspacesList();

  return distinct([
    ...updatedWorkspace,
    ...updatedWorkspace.flatMap(workspace => {
      return getDependentWorkspace({
        dependency: workspace,
        allWorkspaces
      }).map(v => v.location);
    })
  ]);
}
