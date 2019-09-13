import mergeMessages from './mergeMessages';

describe('mergeMessages', () => {
  it('should merge objects from an array', () => {
    const result = mergeMessages([{ foo: 'bar' }, { buh: 'baz' }, { gah: 'wut' }]);
    expect(result).toEqual({
      foo: 'bar',
      buh: 'baz',
      gah: 'wut',
    });
  });

  it('should return an empty object if no messages', () => {
    expect(mergeMessages(undefined)).toEqual({});
    expect(mergeMessages(null)).toEqual({});
    expect(mergeMessages([])).toEqual({});
  });
});
