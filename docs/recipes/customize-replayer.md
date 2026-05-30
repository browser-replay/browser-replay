# Customize the Replayer

When the [@browser-replay/player](../../packages/player/) UI does not fit your needs, you can customize your own replayer UI.

There are several ways to do this:

1. Use [@browser-replay/player](../../packages/player/) and customize its CSS.
2. Use the `insertStyleRules` option (passed to the underlying `Replayer`) to inject additional CSS into the replay iframe.
3. Build a completely custom UI using the low-level `Replayer` from `@browser-replay/replay` + `@browser-replay/player-core`.

## Customizing the React Player

The easiest way to customize is to use the React player component and style it via CSS or pass props.

```jsx
import { DomReplayPlayer } from '@browser-replay/player';
import '@browser-replay/player/dist/style.css';

// Basic usage
<DomReplayPlayer 
  events={events} 
  autoPlay 
  showController={false} 
/>

// With ref for programmatic control
const playerRef = useRef(null);

<DomReplayPlayer 
  ref={playerRef} 
  events={events} 
/>

// Programmatic control via ref
playerRef.current?.play();
playerRef.current?.pause();
playerRef.current?.setSpeed(2);
playerRef.current?.goto(3000);
```

### Listening to Player State

The React player exposes state via the `onStateChange` prop and also forwards events from the underlying Replayer.

```jsx
<DomReplayPlayer 
  events={events}
  onStateChange={(state) => {
    console.log('Current time:', state.currentTime);
    console.log('Is playing:', state.playerState === 'playing');
  }}
/>
```

You can also listen to low-level Replayer events:

```jsx
const playerRef = useRef(null);

<DomReplayPlayer 
  ref={playerRef} 
  events={events} 
/>

// Listen to events
useEffect(() => {
  const handle = playerRef.current?.getReplayer();
  if (handle) {
    handle.on('finish', () => console.log('Replay finished'));
  }
}, []);
```

## Full Custom UI with Low-Level Replayer

For maximum control, use the core `Replayer` directly:

```js
import { Replayer } from '@browser-replay/replay';

const replayer = new Replayer(events, {
  root: document.getElementById('replay-container'),
  // ... other options
});

replayer.play();
```

See the [customize-replayer recipe](./customize-replayer.md) in the recipes folder for more advanced patterns.
