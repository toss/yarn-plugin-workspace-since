import * as execa from 'execa';
import WorkspaceEntry from './WorkspaceEntry';

export default async function getWorkspacesList() {
  const { stdout } = await execa(`yarn`, [`workspaces`, `list`, `--json`, `--verbose`]);

  return stdout.split('\n').map(text => {
    return JSON.parse(text) as WorkspaceEntry;
  });
}
