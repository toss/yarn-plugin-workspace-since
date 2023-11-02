# yarn-plugin-workspace-since

since는 [yarn berry](https://github.com/yarnpkg/berry) workspace 플러그인입니다.

## Installation

### Yarn 버전 4를 사용하는 경우

```shell
$ yarn plugin import https://raw.githubusercontent.com/toss/yarn-plugin-workspace-since/main/bundles/%40yarnpkg/plugin-workspace-since.js
```

### Yarn 버전 2, 3을 사용하는 경우

since는 [@yarn/plugin-workspace-tools](https://github.com/yarnpkg/berry/tree/master/packages/plugin-workspace-tools)에 의존합니다. 따라서 먼저 workspace-tools를 설치해야 합니다.

```bash
$ yarn plugin import https://raw.githubusercontent.com/toss/yarn-plugin-workspace-since/c9967e8349731e464813f54ca95c0614263f59a9/bundles/%40yarnpkg/plugin-workspace-since.js
```

## Usage

### `run`

주어진 두 git revision 사이에 변경점이 있는 workspace에 대해서 주어진 명령어를 실행합니다. 변경점은 파생됩니다. "A" workspace에 의존성을 가진 "B" workspace가 있을때 "A", "B" 모두에 대해서 `run`이 실행됩니다.

변경된 workspace가 없다면 아무것도 실행하지 않습니다.

```bash
$ yarn workspaces since run <command> <from> [to]
```

#### Arguments

- `command`: 실행할 명령어를 지정합니다. `command`를 `test`로 지정한다면, 각 workspace 디렉토리에서 `yarn test`를 실행합니다. `package.json`의 `scripts` 에 지정되지 않은 명령어도 실행합니다. 지정한 명령어가 존재하지 않는 경우, 무시합니다.
- `from`: 시작 리비전입니다.
- `to`: 끝 리비전입니다. 지정하지 않으면 `HEAD`가 기본값입니다.

#### Options

- `--jobs`: 주어진 숫자만큼 `run`을 병렬적으로 실행합니다. 지정하지 않으면 `1`이 기본값입니다.
- `--include`: 변경된 workspace 중 `run`을 실행할 workspace를 glob pattern으로 지정합니다. 지정하지 않으면 모든 workspace를 대상으로 합니다.
- `--ignore`: 변경사항이 발생해도 무시할 workspace를 glob pattern으로 지정합니다. 무시된 workspace의 변경점은 파생되지 않습니다.
- `--ignore-errors`: `true`로 지정하면 `run` 실행 중 에러가 발생했을 때에도 무시하고 실행을 계속합니다.

#### Examples

##### `main` 브랜치와 `develop` 사이에 변경이 있는 workspace에 대해 `test` 명령어 실행

```bash
$ yarn workspaces since run test main develop
```

##### `HEAD` 바로 이전 커밋과 `HEAD` 사이에 변경이 있는 workspace에 대해 `npm publish` 실행

```bash
$ yarn workspaces since run 'npm publish' $(git rev-parse HEAD~1)
```
