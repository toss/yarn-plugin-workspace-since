import distinct from './distinct';

describe('distinct', () => {
  it('주어진 배열에서 중복을 제거하여 리턴한다', () => {
    const arr = [`a`, `b`, `c`];

    const result = distinct([...arr, ...arr]);

    expect(result).toEqual(arr);
  });
});
