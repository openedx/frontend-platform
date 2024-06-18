/**
 * @implements {TealiumLoader}
 * @memberof module:TealiumLoader
 */
class TealiumLoader {
  constructor({ config }) {
    this.account = config.TEALIUM_ACCOUNT;
    this.profile = config.TEALIUM_PROFILE;
    this.env = config.TEALIUM_ENV;
  }

  loadScript() {
    if (!this.account && !this.profile && !this.env) {
      return;
    }

    global.tealiumAnalytics = global.tealiumAnalytics || [];
    const { tealiumAnalytics } = global;

    // If the snippet was invoked do nothing.
    if (tealiumAnalytics.invoked) {
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    tealiumAnalytics.invoked = true;

    tealiumAnalytics.load = (account, profile, env) => {
      const scriptTealium = document.createElement('script');
      scriptTealium.type = 'text/javascript';
      scriptTealium.innerHTML = `
      (function (a, b, c, d) { a = '//tags.tiqcdn.com/utag/${account}/${profile}/${env}/utag.js'; b = document; 
      c = 'script'; d = b.createElement(c); d.src = a; d.type = 'text/java' + c; d.async = true; a = b.getElementsByTagName(c)[0]; a.parentNode.insertBefore(d, a) })();
      `;

      // Insert our scripts next to the first script element.
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(scriptTealium, first);
    };

    // Load tealiumAnalytics.
    tealiumAnalytics.load(this.account, this.profile, this.env);
  }
}

export default TealiumLoader;
