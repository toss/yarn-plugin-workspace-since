import { CommandContext } from '@yarnpkg/core';
import { Command } from 'clipanion';
import getUpdatedWorkspaces from '../getUpdatedWorkspaces';

class ListCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: `변경사항이 있는 workspace 목록을 출력합니다.`,
    details: `변경된 workspace 가 없으면 아무것도 출력하지 않습니다.`,
    examples: [
      [
        `main 브랜치와 HEAD 사이에 변경이 있는 workspace 목록 출력`,
        `yarn workspaces since list main`
      ],
      [
        `main 브랜치와 ci/main 태그 사이에 변경이 있는 workspace 목록 출력`,
        `yarn workspaces since list main ci/main`
      ]
    ]
  });

  @Command.String({ required: true, name: `from` })
  from: string;

  @Command.String({ required: false, name: `to` })
  to = 'HEAD';

  @Command.Path(`workspaces`, `since`, `list`)
  async execute() {
    const updatedWorkspaces = await getUpdatedWorkspaces({
      from: this.from,
      to: this.to
    });

    if (updatedWorkspaces.length === 0) {
      return;
    }

    this.context.stdout.write(updatedWorkspaces.join('\n'));
  }
}

export default ListCommand;
