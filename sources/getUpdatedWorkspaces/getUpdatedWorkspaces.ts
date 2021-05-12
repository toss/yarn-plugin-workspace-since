import { getUpdatedPackages } from '@tossteam/updated-packages';
import * as minimatch from 'minimatch';
import distinct from './distinct';
import getDependentWorkspace from './getDependentWorkspace';
import getWorkspacesList from '../Workspace/getWorkspacesList';
import { PackageJson } from '../PackageJson';

export default async function getUpdatedWorkspaces({
  from,
  to,
  ignore = '',
}: {
  from: string;
  to: string;
  ignore?: string;
}) {
  const workspaces = PackageJson('.').workspaces.filter(v => !minimatch(v, ignore));

  const updatedWorkspace = (
    await getUpdatedPackages(process.cwd(), {
      from,
      to,
      workspaces,
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
