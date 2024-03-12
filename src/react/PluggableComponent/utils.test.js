import { isPluginAvailable, getPluginsByPrefix } from './utils';

jest.mock('@root_path/package.json', () => ({
  dependencies: {
    '@openedx-plugins/plugin-a': '1.0.0',
    '@openedx-plugins/prefix-plugin-b': '1.2.3',
    'some-other-dependency': '2.3.4',
    '@openedx-plugins/prefix-plugin-c': '3.4.5',
    '@another-prefix/plugin-d': '4.5.6',
  },
}));

describe('Utils', () => {
  describe('isPluginAvailable util', () => {
    test('returns true if a plugin is installed', async () => {
      const checkBoxPlugin = await isPluginAvailable('any-mfe-plugins-test');
      expect(checkBoxPlugin).toBe(true);
    });

    test('returns false if a plugin is not installed', async () => {
      const nonexistentPlugin = await isPluginAvailable('nonexistentPlugin');
      expect(nonexistentPlugin).toBe(false);
    });

    test('returns false if an empty string is provided as plugin name', async () => {
      const emptyPlugin = await isPluginAvailable('');
      expect(emptyPlugin).toBe(false);
    });

    test('returns false if null is provided as plugin name', async () => {
      const nullPLugin = await isPluginAvailable(null);
      expect(nullPLugin).toBe(false);
    });
  });

  describe('getPluginsByPrefix', () => {
    test('should return an array of plugin names filtered by the given prefix', () => {
      const plugins = getPluginsByPrefix('prefix');
      const mockExpectedResult = [
        { id: 'prefix-plugin-b', name: 'prefix-plugin-b' },
        { id: 'prefix-plugin-c', name: 'prefix-plugin-c' },
      ];
      expect(plugins).toEqual(mockExpectedResult);
    });

    test('should return an empty array if no plugins match the given prefix', () => {
      const plugins = getPluginsByPrefix('nonexistent');
      expect(plugins).toHaveLength(0);
      expect(plugins).toEqual([]);
    });
  });
});
