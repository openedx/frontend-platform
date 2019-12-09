/**
 * JSDoc plugin.
 *
 * Modifies the source code to remove the "export" keyword before JS doc sees it.  This removes
 * "exports." prefixes from documented members.
 *
 * @module plugins/exportKiller
 */
exports.handlers = {
  beforeParse(e) {
    e.source = e.source.replace(/(\nexport function)/g, $ => {
        return `\nfunction`;
    });
    e.source = e.source.replace(/(\nexport const)/g, $ => {
      return `\nconst`;
    });
    e.source = e.source.replace(/(\nexport default)/g, $ => {
      return `\n`;
    });
    e.source = e.source.replace(/(\nexport async function)/g, $ => {
      return `\nasync function`;
    });
  }
};
