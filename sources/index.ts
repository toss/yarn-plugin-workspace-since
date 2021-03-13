import { CommandContext, Plugin } from '@yarnpkg/core';
import ListCommand from './commands/list/ListCommand';

const plugin: Plugin = {
  hooks: {
    afterAllInstalled: () => {
      console.log(
        `👋 yarn workspaces since 플러그인을 설치해주셔서 감사합니다. 이 플러그인이 좋았다면 좋아요 구독 잊지마세요!`
      );
    }
  },
  commands: [ListCommand]
};

export default plugin;
