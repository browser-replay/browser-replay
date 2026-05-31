import * as fs from 'fs';
import * as path from 'path';
import { vi } from 'vitest';
import { launchPuppeteer, waitForRAF, defaultImageSnapshotOptions } from '../utils';
import type * as puppeteer from 'puppeteer';
import events from '../events/hover';

interface ISuite {
  code: string;
  styles: string;
  browser: puppeteer.Browser;
  page: puppeteer.Page;
}

describe('replayer', function () {
  vi.setConfig({ testTimeout: 20_000, hookTimeout: 30_000 });

  let code: ISuite['code'];
  let styles: ISuite['styles'];
  let browser: ISuite['browser'];
  let context: puppeteer.BrowserContext;
  let page: ISuite['page'];

  beforeAll(async () => {
    browser = await launchPuppeteer({ devtools: true });
    context = await browser.createBrowserContext();

    const bundlePath = path.resolve(__dirname, '../../dist/core.umd.cjs');
    const stylePath = path.resolve(
      __dirname,
      '../../src/replay/styles/style.css',
    );
    code = fs.readFileSync(bundlePath, 'utf8');
    styles = fs.readFileSync(stylePath, 'utf8');
  });

  beforeEach(async () => {
    page = await context.newPage();
    await page.goto('about:blank');
    await page.addStyleTag({
      content: styles,
    });
    await page.evaluate(code);
    await page.evaluate(`let events = ${JSON.stringify(events)}`);

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('hover', () => {
    it('should trigger hover on mouseDown', async () => {
      if (process.env.CI === 'true') return;
      await page.evaluate(`
      const { Replayer } = browserReplay;
      const replayer = new Replayer(events, { UNSAFE_allowUnprotectedRebuild: true });
      replayer.pause(110);
    `);

      await waitForRAF(page);
      await waitForRAF(page);

      const image = await page.screenshot();
      expect(image).toMatchImageSnapshot({
        ...defaultImageSnapshotOptions,
        failureThreshold: 0.04,
      });
    });
  });
});
