import * as frontendI18n from '@edx/frontend-i18n';
import i18n, { mergeMessages } from './i18n';

jest.mock('@edx/frontend-i18n', () => ({
  configure: jest.fn(),
}));

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

describe('i18n', () => {
  beforeEach(() => {
    jest.spyOn(frontendI18n, 'configure');
  });

  it('should call configure with the app config and messages object', () => {
    const app = {
      messages: { foo: 'bar' },
      config: { boo: 'baz' },
    };
    i18n(app);
    expect(frontendI18n.configure).toHaveBeenCalledWith(app.config, app.messages);
  });

  it('should call configure with the app config and merged messages array', () => {
    const app = {
      messages: [{ foo: 'bar' }, { foo: 'buh' }, { gah: 'wut' }],
      config: { boo: 'baz' },
    };
    i18n(app);
    expect(frontendI18n.configure).toHaveBeenCalledWith(app.config, { foo: 'buh', gah: 'wut' });
  });
});
