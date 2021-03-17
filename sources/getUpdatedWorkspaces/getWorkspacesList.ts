import * as execa from 'execa';
import WorkspaceEntry from './WorkspaceEntry';

const ROOT_LOCATION = `.`;

export default async function getWorkspacesList() {
  const { stdout } = await execa(`yarn`, [`workspaces`, `list`, `--json`, `--verbose`]);

  return stdout
    .split('\n')
    .map<WorkspaceEntry>(text => JSON.parse(text))
    .filter(work => work.location !== ROOT_LOCATION);
}
