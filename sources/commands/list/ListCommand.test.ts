import ListCommand from './ListCommand';

describe('ListCommand', () => {
  it('logs Since List Command', () => {
    const log = jest.spyOn(console, `log`);
    const command = new ListCommand();

    command.execute();

    expect(log).toHaveBeenCalledWith(`Since List Worked!`);
  });
});
