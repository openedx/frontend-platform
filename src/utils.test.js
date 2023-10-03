import {
  modifyObjectKeys,
  camelCaseObject,
  snakeCaseObject,
  convertKeyNames,
  parseURL,
  getPath,
  getQueryParameters,
} from '.';

describe('modifyObjectKeys', () => {
  it('should use the provided modify function to change all keys in and object and its children', () => {
    function meowKeys(key) {
      return `${key}Meow`;
    }

    const result = modifyObjectKeys(
      {
        one: undefined,
        two: null,
        three: '',
        four: 0,
        five: NaN,
        six: [1, 2, { seven: 'woof' }],
        eight: { nine: { ten: 'bark' }, eleven: true },
      },
      meowKeys,
    );

    expect(result).toEqual({
      oneMeow: undefined,
      twoMeow: null,
      threeMeow: '',
      fourMeow: 0,
      fiveMeow: NaN,
      sixMeow: [1, 2, { sevenMeow: 'woof' }],
      eightMeow: { nineMeow: { tenMeow: 'bark' }, elevenMeow: true },
    });
  });
});

describe('camelCaseObject', () => {
  it('should make everything camelCase', () => {
    const result = camelCaseObject({
      what_now: 'brown cow',
      but_who: { says_you_people: 'okay then', but_how: { will_we_even_know: 'the song is over' } },
      'dot.dot.dot': 123,
    });

    expect(result).toEqual({
      whatNow: 'brown cow',
      butWho: { saysYouPeople: 'okay then', butHow: { willWeEvenKnow: 'the song is over' } },
      dotDotDot: 123,
    });
  });
});

describe('snakeCaseObject', () => {
  it('should make everything snake_case', () => {
    const result = snakeCaseObject({
      whatNow: 'brown cow',
      butWho: { saysYouPeople: 'okay then', butHow: { willWeEvenKnow: 'the song is over' } },
      'dot.dot.dot': 123,
    });

    expect(result).toEqual({
      what_now: 'brown cow',
      but_who: { says_you_people: 'okay then', but_how: { will_we_even_know: 'the song is over' } },
      dot_dot_dot: 123,
    });
  });
});

describe('convertKeyNames', () => {
  it('should replace the specified keynames', () => {
    const result = convertKeyNames(
      {
        one: { two: { three: 'four' } },
        five: 'six',
      },
      {
        two: 'blue',
        five: 'alive',
        seven: 'heaven',
      },
    );

    expect(result).toEqual({
      one: { blue: { three: 'four' } },
      alive: 'six',
    });
  });
});

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

describe('ParseURL', () => {
  const testURL = 'http://example.com:3000/pathname/?search=test#hash';
  const parsedURL = parseURL(testURL);
  it('String URL is correctly parsed', () => {
    expect(parsedURL.toString()).toEqual(testURL);
    expect(parsedURL.href).toEqual(testURL);
    expect(typeof (parsedURL)).toEqual('object');
  });

  it('should return protocol from URL', () => {
    expect(parsedURL.protocol).toEqual('http:');
  });

  it('should return hostname from URL', () => {
    expect(parsedURL.hostname).toEqual('example.com');
  });

  it('should return port from URL', () => {
    expect(parsedURL.port).toEqual('3000');
  });

  it('should return pathname from URL', () => {
    expect(parsedURL.pathname).toEqual('/pathname/');
  });

  it('should return search rom URL', () => {
    expect(parsedURL.search).toEqual('?search=test');
  });

  it('should return hash from URL', () => {
    expect(parsedURL.hash).toEqual('#hash');
  });

  it('should return host from URL', () => {
    expect(parsedURL.host).toEqual('example.com:3000');
  });
});

describe('getPath', () => {
  it('Path is retrieved with full url', () => {
    const testURL = 'http://example.com:3000/pathname/?search=test#hash';

    expect(getPath(testURL)).toEqual('/pathname/');
  });

  it('Path is retrieved with only path', () => {
    const testURL = '/learning/';

    expect(getPath(testURL)).toEqual('/learning/');
  });

  it('Path is retrieved without protocol', () => {
    const testURL = '//example.com:3000/accounts/';

    expect(getPath(testURL)).toEqual('/accounts/');
  });

  it('Path is retrieved with base `/`', () => {
    const testURL = '/';

    expect(getPath(testURL)).toEqual('/');
  });

  it('Path is retrieved without port', () => {
    const testURL = 'https://example.com/accounts/';

    expect(getPath(testURL)).toEqual('/accounts/');
  });

  it('Path is retrieved without CDN shape', () => {
    const testURL = 'https://d20blt6w1kfasr.cloudfront.net/learning/';

    expect(getPath(testURL)).toEqual('/learning/');
  });
});
