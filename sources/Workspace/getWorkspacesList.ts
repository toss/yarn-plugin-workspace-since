import * as execa from 'execa';
import WorkspaceEntry from './WorkspaceEntry';

const ROOT_LOCATION = `.`;

export default async function getWorkspacesList({ cwd = process.cwd() }: { cwd?: string } = {}) {
  const { stdout } = await execa(`yarn`, [`workspaces`, `list`, `--json`, `--verbose`], {
    cwd,
  });

  return stdout
    .split('\n')
    .map<WorkspaceEntry>(text => JSON.parse(text))
    .filter(work => work.location !== ROOT_LOCATION);
}
