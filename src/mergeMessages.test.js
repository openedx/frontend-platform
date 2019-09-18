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

  it('should merge nested objects from an array', () => {
    const messages = [
      {
        en: { hello: 'hello' },
        es: { hello: 'hola' },
      },
      {
        en: { goodbye: 'goodbye' },
        es: { goodbye: 'adiós' },
      },
    ];

    const result = mergeMessages(messages);
    expect(result).toEqual({
      en: {
        hello: 'hello',
        goodbye: 'goodbye',
      },
      es: {
        hello: 'hola',
        goodbye: 'adiós',
      },
    });
  });

  it('should return an empty object if no messages', () => {
    expect(mergeMessages(undefined)).toEqual({});
    expect(mergeMessages(null)).toEqual({});
    expect(mergeMessages([])).toEqual({});
  });
});
