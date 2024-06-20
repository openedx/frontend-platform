import ScriptInserter from './ScriptInserter';

describe('ScriptInserter', () => {
  let data;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  function loadScripts(scriptData) {
    const scriptInserter = new ScriptInserter(scriptData);
    scriptInserter.loadScript();
  }

  describe('with multiple scripts', () => {
    beforeEach(() => {
      data = {
        config: {
          EXTERNAL_SCRIPTS: [
            {
              head: '<script>console.log("First head script");</script>',
              body: {
                top: '<script>console.log("First body top script");</script>',
                bottom: '<script>console.log("First body bottom script");</script>',
              },
            },
            {
              head: '<script src="https://example.com/second-script.js"></script>',
            },
            {
              body: {
                top: '<script>console.log("Third body top script");</script>',
              },
            },
          ],
        },
      };
      loadScripts(data);
    });

    it('should insert all head scripts', () => {
      const headScripts = document.head.querySelectorAll('script');
      expect(headScripts.length).toBe(2);

      const inlineHeadScript = Array.from(headScripts)
        .find(script => script.src === '' && script.innerHTML.includes('console.log("First head script")'));
      const srcHeadScript = document.head
        .querySelector('script[src="https://example.com/second-script.js"]');

      expect(inlineHeadScript).not.toBeNull();
      expect(srcHeadScript).not.toBeNull();
      expect(srcHeadScript.async).toBe(true);
    });

    it('should insert all body top scripts in correct order', () => {
      const bodyTopScripts = document.body.querySelectorAll('script');
      expect(bodyTopScripts.length).toBe(3); // Top scripts + Bottom script

      const firstTopScript = Array.from(bodyTopScripts)
        .find(script => script.innerHTML.includes('console.log("First body top script")'));
      const thirdTopScript = Array.from(bodyTopScripts)
        .find(script => script.innerHTML.includes('console.log("Third body top script")'));

      expect(firstTopScript).not.toBeNull();
      expect(thirdTopScript).not.toBeNull();
    });

    it('should insert all body bottom scripts', () => {
      const bodyBottomScripts = Array.from(document.body.querySelectorAll('script'))
        .filter(script => script.innerHTML.includes('First body bottom script'));
      expect(bodyBottomScripts.length).toBe(1);

      const firstBottomScript = bodyBottomScripts[0];
      expect(firstBottomScript.innerHTML).toBe('console.log("First body bottom script");');
    });
  });

  describe('with no external scripts', () => {
    beforeEach(() => {
      data = {
        config: {
          EXTERNAL_SCRIPTS: [],
        },
      };
      loadScripts(data);
    });

    it('should not insert any scripts', () => {
      expect(document.head.querySelectorAll('script').length).toBe(0);
      expect(document.body.querySelectorAll('script').length).toBe(0);
    });
  });
});
