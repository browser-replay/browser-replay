import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import exampleEvents from './events/example';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoPkgRoot = path.resolve(__dirname, '..');

describe('should be able to run cli', () => {
  beforeAll(() => {
    fs.mkdirSync(path.resolve(__dirname, './generated'));
    fs.writeJsonSync(
      path.resolve(__dirname, './generated/example.json'),
      exampleEvents,
      {
        spaces: 2,
      },
    );
  });
  afterAll(async () => {
    await fs.remove(path.resolve(__dirname, './generated'));
  });

  const execOptions = {
    stdio: 'pipe' as const,
    timeout: 60_000,
    cwd: videoPkgRoot,
  };

  it('should throw error without input path', () => {
    expect(() => {
      execSync('node ./build/cli.js', execOptions);
    }).toThrow(/please pass --input to your events JSON file/);
  });

  it('should generate a video without output path', () => {
    execSync(
      'node ./build/cli.js --input ./test/generated/example.json',
      execOptions,
    );
    const outputFile = path.join(
      videoPkgRoot,
      'dom-replay-video-output.webm',
    );
    expect(fs.existsSync(outputFile)).toBe(true);
    fs.removeSync(outputFile);
  });

  it('should generate a video with specific output path', () => {
    const outputFile = path.resolve(__dirname, './generated/output.webm');
    execSync(
      `node ./build/cli.js --input ./test/generated/example.json --output ${outputFile}`,
      execOptions,
    );
    expect(fs.existsSync(outputFile)).toBe(true);
    fs.removeSync(outputFile);
  });
});
