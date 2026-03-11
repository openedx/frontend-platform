/**
 * @implements {GoogleTagManagerLoader}
 * @memberof module:GoogleTagManagerLoader
 */
class GoogleTagManagerLoader {
  constructor({ config }) {
    this.gtmId = config.GOOGLE_TAG_MANAGER_ID;
  }

  loadScript() {
    if (!this.gtmId) {
      return;
    }

    global.google_tag_manager = global.google_tag_manager || [];
    const { google_tag_manager: googleTagManager } = global;

    // If the snippet was invoked do nothing.
    if (googleTagManager.invoked) {
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    googleTagManager.invoked = true;

    googleTagManager.load = (id) => {
      const gtmScript = document.createElement('script');
      gtmScript.type = 'text/javascript';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer', '${id}');
      `;

      // Insert our scripts next to the first script element.
      const first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(gtmScript, first);
    };

    // Load gtmAnalytics.
    googleTagManager.load(this.gtmId);
  }
}

export default GoogleTagManagerLoader;
