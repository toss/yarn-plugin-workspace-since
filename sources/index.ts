import { Plugin } from '@yarnpkg/core';
import ListCommand from './commands/ListCommand';
import RunCommand from './commands/RunCommand';
import VersionCommand from './commands/VersionCommand';

const plugin: Plugin = {
  commands: [ListCommand, RunCommand, VersionCommand]
};

export default plugin;
