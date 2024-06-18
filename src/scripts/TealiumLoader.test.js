import { TealiumLoader } from '.';

describe('TealiumLoader', () => {
    let body;
    let tealiumScriptSrc;
    let data;

    beforeEach(() => {
        window.tealiumAnalytics = [];
    });

    function loadTealium(scriptData) {
        const script = new TealiumLoader(scriptData);
        script.loadScript();
    }

    describe('with valid TEALIUM_ACCOUNT, TEALIUM_PROFILE, and TEALIUM_ENV', () => {
        beforeEach(() => {
            document.body.innerHTML = '<script id="stub" />';
            data = {
                config: {
                    TEALIUM_ACCOUNT: 'test-account',
                    TEALIUM_PROFILE: 'test-profile',
                    TEALIUM_ENV: 'test-env',
                },
            };
            loadTealium(data);
            expect(global.tealiumAnalytics.invoked).toBe(true);
            body = document.body.innerHTML;
            tealiumScriptSrc = `//tags.tiqcdn.com/utag/test-account/test-profile/test-env/utag.js`;
        });

        it('should initialize Tealium', () => {
            expect(body).toMatch(tealiumScriptSrc);
        });

        it('should be two snippets', () => {
            loadTealium(data);

            expect(global.tealiumAnalytics.invoked).toBe(true);
            expect(body).toMatch(tealiumScriptSrc);

            let count = (body.match(new RegExp(tealiumScriptSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

            expect(count).toBe(2);
        });
    });

    describe('with missing TEALIUM_ACCOUNT, TEALIUM_PROFILE, and TEALIUM_ENV', () => {
        beforeEach(() => {
            document.body.innerHTML = '<script id="stub" />';
            data = {
                config: {
                    TEALIUM_ACCOUNT: '',
                    TEALIUM_PROFILE: '',
                    TEALIUM_ENV: '',
                },
            };
            loadTealium(data);
            body = document.body.innerHTML;
            tealiumScriptSrc = '//tags.tiqcdn.com/utag/test-account/test-profile/test-env/utag.js';
            expect(global.tealiumAnalytics.invoked).toBeFalsy();
        });

        it('should not initialize Tealium', () => {
            expect(body).not.toMatch(tealiumScriptSrc);
        });
    });
});
