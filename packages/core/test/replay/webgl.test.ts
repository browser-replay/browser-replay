import * as fs from 'fs';
import * as path from 'path';
import { vi } from 'vitest';
import { launchPuppeteer } from '../utils';
import type * as puppeteer from 'puppeteer';
import events from '../events/webgl';

interface ISuite {
  browser: puppeteer.Browser;
  context: puppeteer.BrowserContext;
  page: puppeteer.Page;
}

describe('replayer', function () {
  vi.setConfig({ testTimeout: 10_000 });

  let browser: ISuite['browser'];
  let context: ISuite['context'];
  let page: ISuite['page'];

  beforeAll(async () => {
    browser = await launchPuppeteer();
    context = await browser.createBrowserContext();
  });

  beforeEach(async () => {
    page = await context.newPage();
    await page.goto('about:blank');
    // mouse cursor canvas is large and pushes the replayer below the fold
    // lets hide it...
    await page.addStyleTag({
      content: '.replayer-mouse-tail{display: none !important;}',
    });
    await page.addScriptTag({
      path: path.resolve(__dirname, '../../dist/core.umd.cjs'),
    });
    await page.evaluate(`let events = ${JSON.stringify(events)}`);

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  afterAll(async () => {
    if (context) await context.close();
    if (browser) await browser.close();
  });

  describe('webgl', () => {
    it('should output simple webgl object', async () => {
      if (process.env.CI === 'true') return;
      await page.evaluate(`
      const { Replayer } = domReplay;
      const replayer = new Replayer(events, {
        UNSAFE_replayCanvas: true,
        UNSAFE_allowUnprotectedRebuild: true,
      });
      replayer.play(2500);
    `);

      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot();
    });
  });
});
