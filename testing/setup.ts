import * as execa from 'execa';

export default async () => {
  await execa('yarn', ['build']);
};
