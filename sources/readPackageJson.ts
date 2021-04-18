import { PackageJson } from 'type-fest';
import * as path from 'path';
import { readFile } from 'fs/promises';

export async function readPackageJson(location = ''): Promise<PackageJson> {
  const resolved = path.resolve(location, `package.json`);

  return JSON.parse(await readFile(`${process.cwd()}${resolved}`, 'utf8'));
}
