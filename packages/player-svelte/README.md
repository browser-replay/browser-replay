_Looking for a Vue.js version? Go here --> [@preflight-hq/@dom-replay/player-vue](https://github.com/Preflight-HQ/@dom-replay/player-vue)_

---

# @dom-replay/player-svelte

Since `@dom-replay/replay` only provides a basic UI, you can use `@dom-replay/player-svelte`, which is built on top of `@dom-replay/core` and provides a feature-rich Svelte player UI.

## How is this different from `Replayer` in `@dom-replay/core`?

`@dom-replay/player-svelte` uses the core `Replayer` under the hood, but since `Replayer` doesn't include any UI for controls, `@dom-replay/player-svelte` adds them.

## Installation

@dom-replay/player-svelte can also be included with `<script>`：

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@dom-replay/player-svelte@latest/dist/style.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@dom-replay/player-svelte@latest/dist/player-svelte.umd.cjs"></script>
```

Or installed by using NPM：

```shell
npm install --save @dom-replay/player-svelte
```

```js
import Player from '@dom-replay/player-svelte';
import '@dom-replay/player-svelte/dist/style.css';
```

## Usage

```js
new Player({
  target: document.body, // customizable root element
  props: {
    events,
  },
});
```

## Options

| key            | default      | description                                                                                          |
| -------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| events         | []           | the events for replaying                                                                             |
| width          | 1024         | the width of the replayer                                                                            |
| height         | 576          | the height of the replayer                                                                           |
| maxScale       | 1            | the maximum scale of the replayer (1 = 100%), set to 0 for unlimited                                 |
| autoPlay       | true         | whether to autoplay                                                                                  |
| speed          | 1            | The default speed to play at                                                                         |
| speedOption    | [1, 2, 4, 8] | speed options in UI                                                                                  |
| showController | true         | whether to show the controller UI                                                                    |
| tags           | {}           | customize the custom events style with a key-value map                                               |
| inactiveColor  | #D4D4D4      | Customize the color of inactive periods indicator in the progress bar with a valid CSS color string. |
| ...            | -            | all the [Replayer options](../../guide.md#options-1) will be bypassed                                |

## methods on the Player component

```ts
addEventListener(event: string, handler: (params: any) => unknown): void;
```

```ts
addEvent(event: eventWithTime): void;
```

```ts
getMetaData() => {
    startTime: number;
    endTime: number;
    totalTime: number;
}
```

```ts
getReplayer() => Replayer;
```

```ts
getMirror() => Mirror;
```

Toggles between play/pause

```ts
toggle();
```

Sets speed of player

```ts
setSpeed(speed: number)
```

Turns on/off skip inactive

```ts
toggleSkipInactive();
```

Triggers resize, do this whenever you change width/height

```ts
triggerResize();
```

Plays replay

```ts
play();
```

Pauses replay

```ts
pause();
```

Go to a point in time and pause or play from then

```ts
goto(timeOffset: number, play?: boolean)
```

Plays from a time to a time and (optionally) loop

```ts
playRange(
    timeOffset: number,
    endTimeOffset: number,
    startLooping: boolean = false,
    afterHook: undefined | (() => void) = undefined,
  )
```
