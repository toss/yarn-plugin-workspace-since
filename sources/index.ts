import { Plugin } from '@yarnpkg/core';
import ListCommand from './commands/ListCommand';
import RunCommand from './commands/RunCommand';

const plugin: Plugin = {
  commands: [ListCommand, RunCommand]
};

export default plugin;
