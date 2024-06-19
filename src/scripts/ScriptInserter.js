/**
 * Class representing a Script Inserter.
 */
class ScriptInserter {
  /**
   * Create a Script Inserter.
   * @param {Array<Object>} scripts - An array of script objects to insert.
   * @param {string} [scripts[].head] - The script to insert into the head section.
   * @param {string} [scripts[].body.top] - The script to insert at the top of the body section.
   * @param {string} [scripts[].body.bottom] - The script to insert at the bottom of the body section.
   */
  constructor({ config }) {
    this.scripts = config.EXTERNAL_SCRIPTS || [];
  }

  /**
   * Inserts the scripts into their respective locations (head, body start, body end).
   */
  loadScript() {
    if (!this.scripts.length) {
      return;
    }

    this.scripts.forEach((script) => {
      if (script.head) {
        this.insertToHead(script.head);
      }
      if (script.body?.top) {
        this.insertToBodyTop(script.body.top);
      }
      if (script.body?.bottom) {
        this.insertToBodyBottom(script.body.bottom);
      }
    });
  }

  /**
   * Inserts content into the head section.
   * @param {string} content - The content to insert into the head section.
   */
  insertToHead(content) {
    const { head } = document;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    while (tempDiv.firstChild) {
      head.appendChild(tempDiv.firstChild);
    }
  }

  /**
   * Inserts content at the start of the body section.
   * @param {string} content - The content to insert at the top of the body section.
   */
  insertToBodyTop(content) {
    const { body } = document;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    while (tempDiv.firstChild) {
      body.insertBefore(tempDiv.firstChild, body.firstChild);
    }
  }

  /**
   * Inserts content at the end of the body section.
   * @param {string} content - The content to insert at the bottom of the body section.
   */
  insertToBodyBottom(content) {
    const { body } = document;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    while (tempDiv.firstChild) {
      body.appendChild(tempDiv.firstChild);
    }
  }
}

export default ScriptInserter;
