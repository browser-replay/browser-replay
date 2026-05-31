# Canvas

Canvas is a special HTML element, and will not be recorded by browser-replay by default.
There are some options for recording and replaying Canvas.

Enable recording Canvas：

```js
browserReplay.record({
  emit(event) {},
  recordCanvas: true,
});
```

Alternatively enable image snapshot recording of Canvas at a maximum of 15 frames per second：

```js
browserReplay.record({
  emit(event) {},
  recordCanvas: true,
  sampling: {
    canvas: 15,
  },
  // optional image format settings
  dataURLOptions: {
    type: 'image/webp',
    quality: 0.6,
  },
});
```

Enable replaying Canvas：

```js
const replayer = new browserReplay.Replayer(events, {
  UNSAFE_replayCanvas: true,
});
replayer.play();
```

**Enable replaying Canvas will remove the sandbox, which may cause a potential security issue.**

Alternatively you can stream canvas elements via webrtc with the [@browser-replay/plugin-canvas-webrtc-record](../../packages/plugins/plugin-canvas-webrtc-record/) & [@browser-replay/plugin-canvas-webrtc-replay](../../packages/plugins/plugin-canvas-webrtc-replay) plugins.
For more information see [canvas-webrtc documentation](../../packages/plugins/plugin-canvas-webrtc-record/Readme.md)
