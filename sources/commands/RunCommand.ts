import * as path from 'path';
import { CommandContext } from '@yarnpkg/core';
import { Command } from 'clipanion';
import * as pLimit from 'p-limit';
import getUpdatedWorkspaces from '../getUpdatedWorkspaces';
import runWorkspaceScript from '../runWorkspaceScript';

class RunCommand extends Command<CommandContext> {
  static usage = Command.Usage({
    description: `변경사항이 있는 workspace에 대해서 주어진 명령어를 실행합니다.`,
    details: `변경된 workspace 가 없으면 아무것도 실행하지 않습니다.`,
    examples: [
      [
        `main 브랜치와 HEAD 사이에 변경이 있는 workspace에 대해 "test" 명령어 실행`,
        `yarn workspaces since run test main`
      ],
      [
        `main 브랜치와 ci/main 태그 사이에 변경이 있는 workspace에 대해 "build" 명령어 실행`,
        `yarn workspaces since run build main ci/main`
      ]
    ]
  });

  @Command.String({ required: true, name: `command` })
  command: string;

  @Command.String({ required: true, name: `from` })
  from: string;

  @Command.String({ required: false, name: `to` })
  to = 'HEAD';

  @Command.Array('--command')
  extraCommands: string[];

  @Command.String(`--jobs`)
  jobs = '1';

  @Command.Path(`workspaces`, `since`, `run`)
  async execute() {
    const limit = pLimit(Number(this.jobs));

    const updatedWorkspaces = await getUpdatedWorkspaces({
      from: this.from,
      to: this.to
    });

    if (updatedWorkspaces.length === 0) {
      this.context.stdout.write(
        `ℹ️  업데이트된 workspace가 없습니다. 명령어를 실행하지 않습니다.\n`
      );
      return;
    }

    this.context.stdout.write(
      `ℹ️  아래 workspace 들에 대해 "${[this.command, ...this.extraCommands].join(', ')}" 명령어를 실행합니다.
---
${updatedWorkspaces.join('\n')}
---\n`
    );

    await Promise.all(
      updatedWorkspaces.map(workspace => {
        return limit(async () => {
          const workspacePath = path.resolve(process.cwd(), workspace);

          await runWorkspaceScript({
            workspacePath,
            workspaceName: workspace,
            scripts: [this.command, ...this.extraCommands],
            stdout: this.context.stdout,
            stdin: this.context.stdin,
            stderr: this.context.stderr
          });
        });
      })
    );
  }
}

export default RunCommand;
