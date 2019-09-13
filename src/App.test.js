
import App, { APP_READY, APP_ERROR } from './App';

describe('App', () => {
  afterEach(() => {
    App.reset();
  });

  it('should throw an error if config is read before being written', () => {
    expect(() => {
      const config = App.config; // eslint-disable-line
    }).toThrow(new Error('App.config has not been initialized. Are you calling it too early?'));
  });

  it('should give the config if it has been set', () => {
    App.config = { booyah: 'yes' };
    expect(App.config).toEqual({ booyah: 'yes' });
  });

  it('should have a default authentication', () => {
    expect(App.authentication).toEqual({
      userId: null,
      username: null,
      administrator: false,
    });
  });

  it('should throw an error if any variable in the config is undefined', () => {
    expect(() => {
      App.config = {
        booyah: undefined,
      };
    }).toThrow(new Error('Module configuration error: booyah is required by App.'));
  });

  it('should call APP_READY callbacks when ready', (done) => {
    function callback(message) {
      expect(message).toBe(APP_READY);
      done();
    }

    App.subscribe(APP_READY, callback);
    App.ready();
  });

  it('should call APP_ERROR callbacks when error', (done) => {
    const origError = new Error('uhoh');
    function callback(message, error) {
      expect(message).toBe(APP_ERROR);
      expect(error).toBe(origError);
      done();
    }

    App.subscribe(APP_ERROR, callback);
    App.error(origError);
  });

  it('should throw an error if apiClient is read before being written', () => {
    expect(() => {
      const apiClient = App.apiClient; // eslint-disable-line
    }).toThrow(new Error('App.apiClient has not been initialized. Are you calling it too early?'));
  });

  it('should give the apiClient if it has been set', () => {
    App.apiClient = 'yes';
    expect(App.apiClient).toEqual('yes');
  });

  describe('queryParams', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '?foo=bar&buh=baz');
    });

    it('should return an object of query parameters', () => {
      const params = App.queryParams;
      expect(params).toEqual({
        foo: 'bar',
        buh: 'baz',
      });
    });
  });

  it('should require config provided via requireConfig', () => {
    App.config = {
      YES: 'yes',
      NO: 'no',
      MAYBE: 'maybe',
    };

    const dichotomyConfig = App.requireConfig(['YES', 'NO'], 'Test');
    const wafflingConfig = App.requireConfig(['MAYBE'], 'Test');

    expect(dichotomyConfig).toEqual({
      YES: 'yes',
      NO: 'no',
    });

    expect(wafflingConfig).toEqual({
      MAYBE: 'maybe',
    });
  });

  it('should throw an error if a piece of required config is not configured', () => {
    expect(() => {
      App.config = {
        YES: 'yes',
      };
      App.requireConfig(['MAYBE'], 'Test');
    }).toThrow(new Error('App configuration error: MAYBE is required by Test.'));
  });
});
