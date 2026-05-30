# Recipes

> You may also want to read the [guide](../../guide.md) to understand the APIs, or read the [design docs](../) to know more technical details of browser-replay.

## Scenarios

### Record And Replay

Record and Replay is the most common use case, which is suitable for any scenario that needs to collect user behaviors and replay them.

[link](./record-and-replay.md)

### Dive Into Events

The events recorded by browser-replay are a set of strictly-typed JSON data. You may discover some flexible ways to use them when you are familiar with the details.

[link](./dive-into-event.md)

### Load Events Asynchronous

When the size of the recorded events increased, load them in one request is not performant. You can paginate the events and load them as you need.

[link](./pagination.md)

### Real-time Replay (Live Mode）

If you want to replay the events in a real-time way, you can use the live mode API. This API is also useful for some real-time collaboration usage.

[link](./live-mode.md)

### Custom Event

You may need to record some custom events along with the browser-replay events, and let them be played as other events. The custom event API was designed for this.

[link](./custom-event.md)

### Interact With UI During Replay

By default, the UI could not interact during replay. But you can use API to enable/disable this programmatically.

[link](./interaction.md)

### Customize The Replayer

When browser-replay's Replayer and the @browser-replay/player UI do not fit your need, you can customize your own replayer UI.

[link](./customize-replayer.md)

### Convert To Video

The event data recorded by browser-replay is a performant, easy to compress, text-based format. And the replay is also pixel perfect.

But if you really need to convert it into a video format, there are some tools that can do this work.

[link](./export-to-video.md)

### Optimize The Storage Size

In some Apps, browser-replay may record an unexpected amount of data. This part will help to find a suitable way to optimize the storage.

[link](./optimize-storage.md)

### Canvas

Canvas is a special HTML element, which will not be recorded by browser-replay by default. There are some options for recording and replaying Canvas.

[link](./canvas.md)

### Console Recorder and Replayer

Starting from v1.0.0, we add the plugin to record and play back console output.
This feature aims to provide developers with more information about the bug scene. There are some options for recording and replaying console output.

[link](./console.md)

### Plugin

The plugin API is designed to extend the function of browser-replay without bumping the size and complexity of its core part.

[link](./plugin.md)
