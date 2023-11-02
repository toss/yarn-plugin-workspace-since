import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { parse } from 'semver';
import { PackageJson as PackageJsonType } from 'type-fest';
import { Level } from '../ConventionalCommits/ConventionalCommit';

export function PackageJson(location: string) {
  const absolutePath = path.resolve(location, `package.json`);
  const raw = JSON.parse(readFileSync(absolutePath, 'utf8')) as PackageJsonType;

  return {
    get version() {
      return raw.version!;
    },
    get workspaces() {
      if (raw.workspaces == null) {
        return undefined;
      }

      if (Array.isArray(raw.workspaces)) {
        return raw.workspaces;
      }

      return raw.workspaces.packages;
    },
    updateVersion(level: Exclude<Level, 'none'>) {
      const semver = parse(raw.version);
      semver.inc(level);
      raw.version = semver.version;

      writeFileSync(absolutePath, `${JSON.stringify(raw, null, 2)}\n`);
    },
  };
}
