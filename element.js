
import {Undoer} from './undoer.js';


const useShadowDOM = false && Element.prototype.attachShadow;


export default class UndoerElement extends HTMLElement {

  static get observedAttributes() {
    return ['state'];
  }

  constructor() {
    super();
    this._root = useShadowDOM ? this.attachShadow({mode: 'open'}) : this;

    // hide from the first attributeChangedCallback call
    this._selfAttributeChange = true;
    window.setTimeout(() => {
      this._selfAttributeChange = false;
    });

    const callback = (data) => {
      const {value, attr} = data;
      this._updateAttribute(attr ? value : null);

      // hooray! tell the client
      this.dispatchEvent(new CustomEvent('state', {detail: value}));
    };

    // set up initial zero undo state from attr
    const zero = this.getAttribute('state');
    const attr = this.hasAttribute('state');
    this._undoer = new Undoer(callback, {value: zero, attr});
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'state' && !this._selfAttributeChange) {
      this._internalSet(newValue, true);
    }
  }

  set state(value) {
    if (!this.isConnected) {
      throw new Error('can\'t push state while disconnected');
    }

    // render if simple "attribute safe" state
    const attr = (typeof value === 'string' || typeof value === 'number');
    this._internalSet(value, attr);
  }

  get state() {
    const {value} = this._undoer.data;
    return value;
  }

  _updateAttribute(value) {
    this._selfAttributeChange = true;
    try {
      if (value) {
        this.setAttribute('state', value);
      } else {
        this.removeAttribute('state');
      }
    } finally {
      this._selfAttributeChange = false;
    }
  }

  _internalSet(value, attr) {
    this._updateAttribute(attr ? value : null);
    this._undoer.push({value, attr}, this._root);
  }

};