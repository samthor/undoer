Native undo/redo behavior for web.
This lets you push native undo stack events onto your pages, so that users can use Ctrl/Cmd-Z—or even use some other gesture (e.g., on iOS devices, you can shake your phone to Undo).

See a [writeup on how this works](https://dev.to/chromiumdev/-native-undo--redo-for-the-web-3fl3) or an [awesome maze-based demo](https://codepen.io/samthor/pen/WJvLxd) for more.

## Usage

Install on NPM/Yarn via `undoer`.
You can use this element as a Web Component or as pure, imperative JavaScript.

### Web Component

Add the dependency to your JS and register it as a CE:

```js
import UndoerElement from './node_modules/undoer/element.js';
customElements.define('undoer-element', AdvancedInputElement);
```

Then add the element to your page, optionally adding `state` attribute to set its zero initial state (otherwise it will be `null`):

```html
<undoer-element state="initial state"></advanced-input>
```

Finally, use the element's JavaScript API:

```js
const undoerEl = document.querySelector('undoer-element');

undoerEl.addEventListener('state', (ev) => {
  console.info('user undo or redid', ev.detail);
});

// set new state with
undoerEl.state = 'new state';
undoerEl.state = /* any object */ ;

// or via attribute for string state
undoerEl.setAttribute('state', 'new state');

```

### Imperative JavaScript

You can also use the raw `Undoer` class without CEs:

```js
import {Undoer} from './node_modules/undoer/undoer.js';
// or
import {Undoer} from 'undoer';  // your build system might allow this

// construct with callback and push state
const initialState = null;  // default is null
const undoer = new Undoer((data) => {
  console.info('user undo or redid', data);
}, initialState);
undoer.push('new state');
```

## Notes

This makes sense as a Web Component as the undo behavior works by adding a hidden `<div contentEditable>` to your page.
In the WC case, this is as a child of the element: in the imperative case, it's added (by default) to `document.body`.
