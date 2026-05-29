# Sandbox

In the [serialization design](./serialization.md) we mentioned the "de-scripting" process, that is, we will not execute any JavaScript in the recorded page during replay, but instead reproduce its effects the snapshots. The `script` tag is rewritten as a `noscript` tag to solve some of the problems. However, there are still some scripted behaviors that are not included in the `script` tag, such as inline scripts in HTML, form submissions, and so on.

There are many kinds of scripting behaviors. A filtering approach to getting rid of these scripts will never be a complete solution, and once a script slips through and is executed, it may cause irreversible unintended consequences. So we use the iframe sandbox feature provided by HTML for browser-level restrictions.

## iframe sandbox

We reconstruct the recorded DOM in an `iframe` element when we rebuild the snapshot. By setting its `sandbox` attribute, we can disable the following behavior:

- Form submission
- pop-up window such as `window.open`
- JS script (including inline event handlers and `javascript:` URLs)

This is in line with our expectations, especially when dealing with JS scripts is safer and more reliable than implementing this security ourselves.

## Avoid link jumps

When you click the a element link, the default event is to jump to the URL corresponding to its href attribute. During replay, we will ensure visually correct replay by rebuilding the page DOM after the jump, and the original jump should be prohibited.

Usually we will capture all an elements click events through the event handler proxy and disable the default event via `event.preventDefault()`. But when we put the replay page in the sandbox, all the event handlers will not be executed, and we will not be able to implement the event delegation.

When replaying interactive events, note that replaying the JS `click` event is not necessary because click events do not have any impact when JS is disabled. However, in order to optimize the replay effect, we can add special animation effects to visualize elements being clicked with the mouse, to clearly show the viewer that a click has occurred.

## iframe style settings

Since we're rebuilding the DOM in an iframe, we can't affect the elements in the iframe through the CSS stylesheet of the parent page. But if JS scripts are not allowed to execute, the `noscript` tag will be displayed, and we want to hide it. So we need to dynamically add styles to the iframe. The sample code is as follows:

```typescript
const injectStyleRules: string[] = [
  'iframe { background: #f1f3f5 }',
  'noscript { display: none !important; }',
];

const styleEl = document.createElement('style');
const { documentElement, head } = this.iframe.contentDocument!;
documentElement!.insertBefore(styleEl, head);
for (let idx = 0; idx < injectStyleRules.length; idx++) {
  (styleEl.sheet! as CSSStyleSheet).insertRule(injectStyleRules[idx], idx);
}
```

Note that this inserted style element does not exist in the original recorded page, so we can't serialize it, otherwise the `id -> Node` mapping will be wrong.

## Recommended: Use sandboxed rebuild helpers for untrusted data (2026 update)

Starting with the port of upstream rrweb improvements (May 2026), `@dom-replay/snapshot` now ships strong protections around the rebuild process itself:

- `rebuild()` now **throws by default** if you attempt to rebuild a snapshot into an unprotected browser `Document`. This prevents scripts and other dangerous content from the recorded session from executing in your replay environment.
- Use the new helpers for safe rebuilds:
  - `createSandboxedIframe({ root, iframeAttributes? })`
  - `rebuildIntoSandboxedIframe(snapshotNode, options)` — preferred for most cases involving user-recorded sessions.

Example (recommended pattern):

```ts
import { rebuildIntoSandboxedIframe } from '@dom-replay/snapshot';

const container = document.getElementById('replay-root')!;
const { iframe, node } = rebuildIntoSandboxedIframe(fullSnapshotNode, {
  root: container,
  hackCss: true,
  cache: createCache(),
  mirror: new Mirror(),
  afterAppend,
});
```

In the high-level `Replayer`, you can opt into the old (less protected) behavior with:

```ts
new Replayer(events, {
  UNSAFE_allowUnprotectedRebuild: true,
});
```

For a critical replay application, we strongly recommend keeping the default (protected) behavior and using the low-level sandboxed helpers when building custom players.

