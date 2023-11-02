import path from 'path';
import { CommandContext } from '@yarnpkg/core';
import { Command, Option } from 'clipanion';
import pLimit from 'p-limit';
import minimatch from 'minimatch';
import getUpdatedWorkspaces from '../getUpdatedWorkspaces';
import runWorkspaceScript from '../runWorkspaceScript';

class RunCommand extends Command<CommandContext> {
  static paths = [[`workspaces`, `since`, `run`]]

  static usage = Command.Usage({
    description: `변경점이 있는 workspace에 대해서 주어진 명령어를 실행합니다.\n변경점은 파생됩니다. "A" workspace에 의존성을 가진 "B" workspace가 있을때 "A", "B" 모두에 대해서 run이 실행됩니다.`,
    details: `변경된 workspace 가 없으면 아무것도 실행하지 않습니다.`,
    examples: [
      [
        `main 브랜치와 HEAD 사이에 변경이 있는 workspace에 대해 "test" 명령어 실행`,
        `yarn workspaces since run test main`,
      ],
      [
        `main 브랜치와 ci/main 태그 사이에 변경이 있는 workspace에 대해 "build" 명령어 실행`,
        `yarn workspaces since run build main ci/main`,
      ],
    ],
  });

  command: string = Option.String({ required: true, name: `command` });

  from: string = Option.String({ required: true, name: `from` });

  to = Option.String({ required: false, name: `to` });;

  jobs = Option.String(`--jobs`, {
    description: `주어진 숫자만큼 run을 병렬적으로 실행합니다.`,
  });

  include = Option.String('--include', {
    description: `변경된 workspace 중 run을 실행할 workspace를 glob pattern으로 지정합니다.`,
  })

  ignore = Option.String(`--ignore`, {
    description: `변경사항이 발생해도 무시할 workspace를 glob pattern으로 지정합니다.\n무시된 workspace의 변경점은 파생되지 않습니다.`,
  })

  ignoreErrors = Option.Boolean('--ignore-errors', {
    description: `run 실행 중 에러가 발생했을 때에도 무시하고 실행을 계속합니다.`,
  })

  async execute() {
    const from = this.from;
    const to = this.to ?? 'HEAD';
    const jobs = this.jobs ?? '1';
    const include = this.include ?? '**'
    const ignore = this.ignore ?? ''
    const ignoreErrors =this.ignoreErrors ?? false;

    const limit = pLimit(Number(jobs ?? `1`));

    const updatedWorkspaces = (
      await getUpdatedWorkspaces({
        from: from,
        to: to ?? `HEAD`,
        ignore: ignore ?? ``,
      })
    ).filter(v => minimatch(v, include ?? `**`));

    if (updatedWorkspaces.length === 0) {
      this.context.stdout.write(
        `ℹ️  업데이트된 workspace가 없습니다. 명령어를 실행하지 않습니다.\n`,
      );
      return;
    }

    this.context.stdout.write(
      `ℹ️  아래 workspace 들에 대해 "${this.command}" 명령어를 실행합니다.
---
${updatedWorkspaces.join('\n')}
---\n`,
    );

    await Promise.all(
      updatedWorkspaces.map(workspace => {
        return limit(async () => {
          const workspacePath = path.resolve(process.cwd(), workspace);

          try {
            await runWorkspaceScript({
              workspacePath,
              workspaceName: workspace,
              script: this.command,
              stdout: this.context.stdout,
              stderr: this.context.stderr,
            });
          } catch (err) {
            if (this.ignoreErrors ?? false) {
              return;
            }

            process.exit(1);
          }
        });
      }),
    );
  }
}

export default RunCommand;
