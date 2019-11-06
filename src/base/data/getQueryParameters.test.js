import getQueryParameters from './getQueryParameters';

describe('getQueryParameters', () => {
  it('should use window location by default', () => {
    expect(global.location.search).toEqual('');
    expect(getQueryParameters()).toEqual({});
  });

  it('should make an empty object with no query string', () => {
    expect(getQueryParameters('')).toEqual({});
  });

  it('should make an object with one key value pair', () => {
    expect(getQueryParameters('?foo=bar')).toEqual({
      foo: 'bar',
    });
  });

  it('should make an object with one key value pair', () => {
    expect(getQueryParameters('?foo=bar&baz=1')).toEqual({
      foo: 'bar',
      baz: '1',
    });
  });
});
