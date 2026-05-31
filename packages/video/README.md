# @browser-replay/video

`@browser-replay/video` transforms a recorded `browser-replay` session (events JSON) into a video.


## Install

1. Install [Node.JS](https://nodejs.org/en/download/)。
2. Run `npm i -g @browser-replay/video` to install the CLI.

## Usage

### Transform a session (JSON) into a video

```shell
browser-replay-video --input PATH_TO_YOUR_EVENTS_FILE
```

Running this command will output a `browser-replay-video-output.webm` file in the current working directory.

### Config the output path

```shell
browser-replay-video --input PATH_TO_YOUR_EVENTS_FILE --output OUTPUT_PATH
```

### Config the replay

You can prepare a player config file (see example below) and pass it to the CLI.

```shell
browser-replay-video --input PATH_TO_YOUR_EVENTS_FILE --config PATH_TO_YOUR_CONFIG_FILE
```

You can find an example config file [here](./browser-replay-video.config.example.json).
