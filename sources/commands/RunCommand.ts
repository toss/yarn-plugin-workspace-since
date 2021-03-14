import { CommandContext } from '@yarnpkg/core';
import { Command } from 'clipanion';
import getUpdatedWorkspaces from '../getUpdatedWorkspaces';

class RunCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: `변경사항이 있는 workspace에 대해서 주어진 명령어를 실행합니다.`,
    details: `변경된 workspace 가 없으면 아무것도 실행하지 않습니다.`,
    examples: [
      [
        `main 브랜치와 HEAD 사이에 변경이 있는 workspace에 대해 "test" 명령어 실행`,
        `yarn workspaces since run test --from main`
      ],
      [
        `main 브랜치와 ci/main 태그 사이에 변경이 있는 workspace에 대해 "build" 명령어 실행`,
        `yarn workspaces since run build --from main --to ci/main`
      ]
    ]
  });

  @Command.String({ required: true, name: `-f,--from` })
  from: string;

  @Command.String({ required: false, name: `-t,--to` })
  to = 'HEAD';

  @Command.Path(`workspaces`, `since`, `run`)
  async execute() {
    const updatedWorksspaces = await getUpdatedWorkspaces({
      from: this.from,
      to: this.to
    });

    if (updatedWorksspaces.length === 0) {
      console.warn(`⚠️  업데이트된 workspace가 없습니다. 명령어를 실행하지 않습니다.`);
      return;
    }

    console.log(updatedWorksspaces.join('\n'));
  }
}

export default RunCommand;
