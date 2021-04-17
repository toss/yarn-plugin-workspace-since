import { collectCommits, getCommitByRef } from '@tossteam/git/dist/commits';
import { CommandContext } from '@yarnpkg/core';
import { Command } from 'clipanion';

class VersionCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: `변경된 패키지에 대해 Semantic Versioning을 자동으로 실행합니다.`,
    details: `
      from으로 부터 to까지 반영된 커밋들을 읽어들입니다.
      읽어들인 커밋 메시지를 Conventional Commits 기준에 따라 해석하고 이에 따라 다음 패키지 버전을 결정합니다.
    `,
    examples: [
      [
        `ci/main 태그와 HEAD 사이에 있는 커밋에 따라 업데이트된 패키지들에 대해 Semantic Versioning`,
        `yarn workspaces since version ci/main`
      ]
    ]
  });

  @Command.String({ required: true, name: `from` })
  from: string;

  @Command.String({ required: false, name: `to` })
  to = 'HEAD';

  @Command.Path(`workspaces`, `since`, `version`)
  async execute() {
    const toRef = await getCommitByRef(this.to, {
      rootDir: process.cwd()
    });

    const commits = await collectCommits(
      this.from,
      commit => {
        return commit.tree === toRef.tree;
      },
      { rootDir: process.cwd() }
    );

    console.log(commits.map(v => v.message).join('\n'));
  }
}

export default VersionCommand;
