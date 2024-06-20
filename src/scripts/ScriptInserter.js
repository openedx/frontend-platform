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
    this.createAndAppendScript(content, document.head);
  }

  /**
   * Inserts content at the start of the body section.
   * @param {string} content - The content to insert at the top of the body section.
   */
  insertToBodyTop(content) {
    this.createAndAppendScript(content, document.body, true);
  }

  /**
   * Inserts content at the end of the body section.
   * @param {string} content - The content to insert at the bottom of the body section.
   */
  insertToBodyBottom(content) {
    this.createAndAppendScript(content, document.body);
  }

  /**
   * Creates a script element and appends it to the specified location.
   * @param {string} content - The content of the script.
   * @param {Element} parent - The parent element to insert the script into (head or body).
   * @param {boolean} atStart - Whether to insert the script at the start of the parent element.
   */
  createAndAppendScript(content, parent, atStart = false) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const scriptElement = tempDiv.querySelector('script');

    if (scriptElement && scriptElement.src) {
      // If the script has a src attribute, create a new script element with the same src
      const newScriptElement = document.createElement('script');
      newScriptElement.src = scriptElement.src;
      newScriptElement.async = true;

      if (atStart && parent.firstChild) {
        parent.insertBefore(newScriptElement, parent.firstChild);
      } else {
        parent.appendChild(newScriptElement);
      }
    } else {
      // If the script does not have a src attribute, insert its inner content as inline script
      const newScriptElement = document.createElement('script');
      newScriptElement.text = scriptElement ? scriptElement.innerHTML : content;

      if (atStart && parent.firstChild) {
        parent.insertBefore(newScriptElement, parent.firstChild);
      } else {
        parent.appendChild(newScriptElement);
      }
    }
  }
}

export default ScriptInserter;
