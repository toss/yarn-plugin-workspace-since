import path from 'path';

/**
 * 테스트에서 사용하는 .yarnrc 의 Yarn Path (실제 Yarn 실행 파일이 위치하는 경로)
 * @see https://yarnpkg.com/configuration/yarnrc#yarnPath
 */
export const YARN_RC_YARN_PATH = path.join('.yarn', 'releases', 'yarn-4.0.1.cjs');

/**
 * Workspace Since 레포지토리에서 사용하는 Yarn 실행 파일의 경로
 * 테스트 레포지토리 등을 만들 때 파일 복사를 위해 사용합니다.
 */
export const YARN_RELEASE_FILE_PATH = path.resolve(__dirname, '..', YARN_RC_YARN_PATH);

/**
 * Yarn Workspace Since 번들 위치
 */
export const YARN_RC_WORKSPACE_SINCE_BUNDLE_PATH = path.join(
  'bundles',
  '@yarnpkg',
  'plugin-workspace-since.js',
);

/**
 * Yarn Workspace Since 경로
 */
export const YARN_WORKSPACE_SINCE_BUNDLE_FILE_PATH = path.resolve(
  __dirname,
  '..',
  YARN_RC_WORKSPACE_SINCE_BUNDLE_PATH,
);
