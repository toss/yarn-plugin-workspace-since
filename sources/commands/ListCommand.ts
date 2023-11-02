import { CommandContext } from '@yarnpkg/core';
import { Command, Option } from 'clipanion';
import getUpdatedWorkspaces from '../getUpdatedWorkspaces';

class ListCommand extends Command<CommandContext> {
  static paths = [[`workspaces`, `since`, `list`]]

  static usage = Command.Usage({
    description: `변경사항이 있는 workspace 목록을 출력합니다.`,
    details: `변경된 workspace 가 없으면 아무것도 출력하지 않습니다.`,
    examples: [
      [
        `main 브랜치와 HEAD 사이에 변경이 있는 workspace 목록 출력`,
        `yarn workspaces since list main`,
      ],
      [
        `main 브랜치와 ci/main 태그 사이에 변경이 있는 workspace 목록 출력`,
        `yarn workspaces since list main ci/main`,
      ],
    ],
  });

  from = Option.String({ required: true, name: `from` })

  to = Option.String({ required: false, name: `to` });

  async execute() {
    const from = this.from;
    const to = this.to ?? 'HEAD';

    const updatedWorkspaces = await getUpdatedWorkspaces({
      from: from,
      to: to,
    });

    if (updatedWorkspaces.length === 0) {
      return;
    }

    this.context.stdout.write(updatedWorkspaces.join('\n'));
  }
}

export default ListCommand;
