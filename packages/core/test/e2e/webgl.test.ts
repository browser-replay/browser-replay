import * as fs from 'fs';
import * as path from 'path';
import type * as puppeteer from 'puppeteer';
import {
  startServer,
  launchPuppeteer,
  getServerURL,
  replaceLast,
  waitForRAF,
  generateRecordSnippet,
  sleep,
  ISuite,
  hideMouseAnimation,
  fakeGoto,
  defaultImageSnapshotOptions,
} from '../utils';
import type { recordOptions } from '../../src/types';
import type { eventWithTime } from '@browser-replay/types';


describe('e2e webgl', () => {
  let code: ISuite['code'];
  let page: ISuite['page'];
  let browser: ISuite['browser'];
  let context: puppeteer.BrowserContext;
  let server: ISuite['server'];
  let serverURL: ISuite['serverURL'];

  beforeAll(async () => {
    server = await startServer();
    serverURL = getServerURL(server);
    browser = await launchPuppeteer();
    context = await browser.createBrowserContext();

    const bundlePath = path.resolve(__dirname, '../../dist/core.umd.cjs');
    code = fs.readFileSync(bundlePath, 'utf8');
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    if (context) await context.close();
    await server.close();
    await browser.close();
  });

  const getHtml = (
    fileName: string,
    options: recordOptions<eventWithTime> = {},
  ): string => {
    const filePath = path.resolve(__dirname, `../html/${fileName}`);
    const html = fs.readFileSync(filePath, 'utf8');
    return replaceLast(
      html,
      '</body>',
      `
    <script>
      ${code}
      ${generateRecordSnippet(options)}
    </script>
    </body>
    `,
    );
  };

  // Image snapshots are sensitive to Chrome version and GPU; run with --update to refresh when environment changes
  it.skip('will record and replay a webgl square', async () => {
    page = await context.newPage();
    await fakeGoto(page, `${serverURL}/html/canvas-webgl-square.html`);

    await page.setContent(
      getHtml.call(this, 'canvas-webgl-square.html', { recordCanvas: true }),
    );

    await waitForRAF(page);

    const snapshots: eventWithTime[] = (await page.evaluate(
      'window.snapshots',
    )) as eventWithTime[];

    page = await context.newPage();

    await page.goto('about:blank');
    await page.evaluate(code);

    await hideMouseAnimation(page);
    await page.evaluate(`let events = ${JSON.stringify(snapshots)}`);
    await page.evaluate(`
      const { Replayer } = browserReplay;
      const replayer = new Replayer(events, {
        UNSAFE_replayCanvas: true,
        UNSAFE_allowUnprotectedRebuild: true,
      });
      replayer.play(500);
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    await waitForRAF(page);
    expect(frameImage).toMatchImageSnapshot(defaultImageSnapshotOptions);
  });

  it.skip('will record and replay a webgl image', async () => {
    page = await context.newPage();
    await fakeGoto(page, `${serverURL}/html/canvas-webgl-image.html`);

    await page.setContent(
      getHtml.call(this, 'canvas-webgl-image.html', { recordCanvas: true }),
    );

    await waitForRAF(page);
    await sleep(100);
    const snapshots: eventWithTime[] = (await page.evaluate(
      'window.snapshots',
    )) as eventWithTime[];

    page = await context.newPage();

    await page.goto('about:blank');
    await page.evaluate(code);

    await hideMouseAnimation(page);
    await page.evaluate(`let events = ${JSON.stringify(snapshots)}`);
    await page.evaluate(`
      const { Replayer } = browserReplay;
      const replayer = new Replayer(events, {
        UNSAFE_replayCanvas: true,
        UNSAFE_allowUnprotectedRebuild: true,
      });
    `);
    // wait for iframe to get added and `preloadAllImages` to ge called
    await page.waitForSelector('iframe');
    await page.evaluate(`replayer.play(500);`);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot();
  });
});
