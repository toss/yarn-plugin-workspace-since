import { CommandContext } from '@yarnpkg/core';
import { Command } from 'clipanion';
import { reduceConventionalCommits, Level } from '../ConventionalCommits';
import getWorkspacesList from '../Workspace/getWorkspacesList';
import * as minimatch from 'minimatch';
import { collectCommits } from '../git/collectCommits';
import { PackageJson } from '../PackageJson';

class VersionCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: `변경된 패키지에 대해 Semantic Versioning을 자동으로 실행합니다.`,
    details: `
      from으로 부터 to까지 반영된 커밋들을 읽어들입니다.
      읽어들인 커밋 메시지를 Conventional Commits 기준에 따라 해석하고 이에 따라 다음 패키지 버전을 결정합니다.
    `,
    examples: [
      [
        `ci/main 태그와 HEAD 사이에 있는 커밋에 따라 업데이트된 패키지들에 대해 Semantic Version Bump`,
        `yarn workspaces since version ci/main`,
      ],
      [
        `"services/*" 디렉토리를 제외한 패키지들에 대해서만 Version Bump`,
        `yarn workspaces since version origin/main --exclude='services/*'`,
      ],
    ],
  });

  @Command.String({ required: true, name: `from` })
  from: string;

  @Command.String({ required: false, name: `to` })
  to = 'HEAD';

  @Command.String('--include')
  include: string = '**';

  @Command.Path(`workspaces`, `since`, `version`)
  async execute() {
    const commits = await collectCommits(this.from, this.to ?? `HEAD`);
    const commitMessages = commits.flatMap(v => v.message.split(`\n`)).filter(v => v !== '');

    const updatedScopes = Object.entries(reduceConventionalCommits(commitMessages));
    const workspaces = await getWorkspacesList();

    for (const [updatedScope, level] of updatedScopes) {
      if (level === Level.none) {
        continue;
      }

      const workspace = workspaces.find(({ location }) => {
        const paths = location.split('/');
        const scope = paths[paths.length - 1];

        return scope === updatedScope;
      });

      if (workspace == null) {
        continue;
      }

      const shouldInclude = minimatch(workspace.location, this.include ?? `**`);

      if (!shouldInclude) {
        continue;
      }

      const pkgJson = PackageJson(workspace.location);
      const prevVersion = pkgJson.version;

      pkgJson.updateVersion(level);

      const updatedVersion = pkgJson.version;

      this.context.stdout.write(
        `ℹ️  ${updatedScope}의 버전이 변경되었습니다: ${prevVersion} ➡️  ${updatedVersion}\n`,
      );
    }
  }
}

export default VersionCommand;
