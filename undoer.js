
export class Undoer {

  /**
   * @template T
   * @param {function(T)} callback to call when undo/redo occurs
   * @param {T=} zero the zero state for undoing everything
   */
  constructor(callback, zero=null) {
    this._duringUpdate = false;
    this._stack = [zero];
 
    // nb. Previous versions of this used `input` for browsers other than Firefox (as Firefox
    // _only_ supports execCommand on contentEditable)
    this._ctrl = document.createElement('div');
    this._ctrl.setAttribute('aria-hidden', 'true');
    this._ctrl.style.opacity = 0;
    this._ctrl.style.position = 'fixed';
    this._ctrl.style.top = '-1000px';
    this._ctrl.style.pointerEvents = 'none';
    this._ctrl.tabIndex = -1;

    this._ctrl.contentEditable = true;
    this._ctrl.textContent = '0';
    this._ctrl.style.visibility = 'hidden';  // hide element while not used

    this._ctrl.addEventListener('focus', (ev) => {
      // Safari needs us to wait, can't blur immediately.
      window.setTimeout(() => void this._ctrl.blur(), 0);
    });
    this._ctrl.addEventListener('input', (ev) => {
      if (!this._duringUpdate) {
        callback(this.data);
      }

      // clear selection, otherwise user copy gesture will copy value
      // nb. this _probably_ won't work inside Shadow DOM
      // nb. this is mitigated by the fact that we set visibility: 'hidden'
      const s = window.getSelection();
      if (s.containsNode(this._ctrl, true)) {
        s.removeAllRanges();
      }
    });
  }

  /**
   * @return {number} the current stack value
   */
  get _depth() {
    return +(this._ctrl.textContent) || 0;
  }

  /**
   * @return {T} the current data
   * @export
   */
  get data() {
    return this._stack[this._depth];
  }

  /**
   * Pushes a new undoable event. Adds to the browser's native undo/redo stack.
   *
   * @param {T} data the data for this undo event
   * @param {!Node=} parent to add to, uses document.body by default
   * @export
   */
  push(data, parent) {
    // nb. We can't remove this later: the only case we could is if the user undoes everything
    // and then does some _other_ action (which we can't detect).
    if (!this._ctrl.parentNode) {
      // nb. we check parentNode as this would remove contentEditable's history
      (parent || document.body).appendChild(this._ctrl);
    }

    const nextID = this._depth + 1;
    this._stack.splice(nextID, this._stack.length - nextID, data);

    const previousFocus = document.activeElement;
    try {
      this._duringUpdate = true;
      this._ctrl.style.visibility = null;
      this._ctrl.focus();
      document.execCommand('selectAll');
      document.execCommand('insertText', false, nextID);
    } finally {
      this._duringUpdate = false;
      this._ctrl.style.visibility = 'hidden';
    }

    previousFocus && previousFocus.focus();
  }
}
