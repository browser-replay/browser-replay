# Customize the Replayer

When rrweb's Replayer and the [@dom-replay/player-svelte](../../packages/player-svelte/) UI do not fit your need, you can customize your replayer UI.

There are several ways to do this:

1. Use [@dom-replay/player-svelte](../../packages/player-svelte/), and customize its CSS.
2. Use [@dom-replay/player-svelte](../../packages/player-svelte/), and set `showController: false` to hide the controller UI. With this config, you can implement your controller UI.
3. Use the `insertStyleRules` options to inject some CSS into the replay iframe.
4. Develop a new replayer UI with rrweb's Replayer.

## Implement Your Controller UI

When using @dom-replay/player-svelte, you can hide its controller UI:

```js
import Player from '@dom-replay/player-svelte';

new Player({
  target: document.body,
  props: {
    events,
    showController: false,
  },
});
```

When you are implementing a controller UI, you may need to interact with @dom-replay/player-svelte.

The follwing APIs show some common use case of a controller UI:

```js
// toggle between play and pause
player.toggle();
// play
player.play();
// pause
player.pause();
// update the dimension
player.$set({
  width: NEW_WIDTH,
  height: NEW_HEIGHT,
});
player.triggerResize();
// toggle whether to skip the inactive time
player.toggleSkipInactive();
// set replay speed
player.setSpeed(2);
// go to some timing
player.goto(3000);
```

And there are some ways to listen @dom-replay/player-svelte's state:

```js
// get current timing
player.addEventListener('ui-update-current-time', (event) => {
  console.log(event.payload);
});

// get current state
player.addEventListener('ui-update-player-state', (event) => {
  console.log(event.payload);
});

// get current progress
player.addEventListener('ui-update-progress', (event) => {
  console.log(event.payload);
});
```

## Develop a new replayer UI with rrweb's Replayer.

Please refer [@dom-replay/player-svelte](https://github.com/rrweb-io/rrweb/tree/master/packages/@dom-replay/player-svelte/).
