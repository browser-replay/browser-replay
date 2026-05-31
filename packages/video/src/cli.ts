#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import minimist from 'minimist';
import cliProgress from 'cli-progress';
import type { PlayerProps } from '@browser-replay/player-core';
import { transformToVideo } from './index';

const argv = minimist(process.argv.slice(2));

if (!argv.input) {
  throw new Error('please pass --input to your events JSON file');
}

let config = {};

if (argv.config) {
  const configPathStr = argv.config as string;
  const configPath = path.isAbsolute(configPathStr)
    ? configPathStr
    : path.resolve(process.cwd(), configPathStr);
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Omit<
    PlayerProps,
    'events'
  >;
}

const pBar = new cliProgress.SingleBar(
  { format: '{prefix} |{bar}| {percentage}%' },
  cliProgress.Presets.shades_classic,
);
pBar.start(100, 0, { prefix: 'Transforming' });
const onProgressUpdate = (percent: number) => {
  if (percent < 1) {
    pBar.update(Math.round(percent * 100));
  } else {
    pBar.update(100, { prefix: 'Completed' });
    pBar.stop();
  }
};

transformToVideo({
  input: argv.input as string,
  output: argv.output as string,
  player: config,
  onProgressUpdate,
})
  .then((file) => {
    console.log(`Successfully transformed into "${file}".`);
  })
  .catch((error) => {
    console.log('Failed to transform this session.');
    console.error(error);
    process.exit(1);
  });
