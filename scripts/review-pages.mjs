// Review the generated Pages output without contacting external services.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const docs = path.join(root, 'docs');
const screenshots = path.join(root, 'outputs/pages-review');
const basePath = '/os-joe/';
const routes = ['', 'home/', 'products/', 'projects/', 'write/', 'arcade/'];
const views = [
  { name: 'laptop', viewport: { width: 1440, height: 750 } },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.rsc': 'text/x-component',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};

await stat(path.join(docs, 'index.html'));
let playwrightModule = process.env.PLAYWRIGHT_MODULE || 'playwright';
let playwright;
try {
  playwright = await import(playwrightModule);
} catch (error) {
  if (process.env.PLAYWRIGHT_MODULE || error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  playwrightModule = path.join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
  playwright = await import(pathToFileURL(playwrightModule).href);
}

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === basePath.slice(0, -1)) {
      response.writeHead(308, { Location: basePath }).end();
      return;
    }
    assert.ok(pathname.startsWith(basePath));
    let file = path.resolve(docs, pathname.slice(basePath.length));
    assert.ok(file === docs || file.startsWith(docs + path.sep));
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(308, { Location: pathname + '/' }).end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end('Not found');
  }
});

let browser;
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
  await mkdir(screenshots, { recursive: true });
  for (const view of views) for (const colorScheme of ['light', 'dark']) {
    const { name, ...options } = view;
    const context = await browser.newContext({ ...options, colorScheme });
    // Use an empty fixture for the shared wall; never read or change real notes.
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      if (url.pathname === '/api/wall' && ['GET', 'OPTIONS'].includes(request.method())) {
        const headers = {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        };
        return request.method() === 'GET'
          ? route.fulfill({ headers, json: { notes: [] } })
          : route.fulfill({ status: 204, headers, body: '' });
      }
      return route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (new URL(response.url()).origin === origin && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    for (const route of routes) {
      const label = `${name}-${colorScheme}-${route.replace('/', '') || 'entrance'}`;
      const response = await page.goto(origin + basePath + route);
      assert.equal(response.status(), 200, label);
      await page.locator('main').waitFor();
      await page.locator('.galaxy-backdrop[data-ripple-renderer]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (route) {
        await page.locator('.os-module-menu a').last().waitFor();
        assert.equal(await page.locator('.os-module-menu a').count(), 5, label);
        assert.equal(await page.locator('.pixel-pet').count(), 1, label);
        await page.getByRole('combobox', { name: 'Background preset' }).selectOption('pixel');
        if (route === 'write/') await page.locator('.note-composer').waitFor();
      }
      assert.equal(await page.locator('audio, .cosmic-radio, [aria-label*="radio" i]').count(), 0, label);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).paddingBottom), '0px', label);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, label);
      assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter(key => /radio/i.test(key))), [], label);
      await page.screenshot({ path: path.join(screenshots, label + '.png'), fullPage: true });
      assert.deepEqual(errors, [], label);
      console.log('PASS:', label);
    }
    await context.close();
  }
  await browser.close();
  browser = null;
  // Retain the existing GPU, keyboard, saved-sky and software-fallback checks.
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['tests/sky-waves.mjs'], {
      cwd: root, stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_MODULE: playwrightModule, HUB_URL: origin + basePath + 'home/' },
    });
    child.once('error', reject);
    child.once('exit', resolve);
  });
  assert.equal(code, 0, 'Existing sky checks must pass');
  console.log('Screenshots:', screenshots);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
