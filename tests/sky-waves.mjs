import assert from 'node:assert/strict';
import { warpSkyImage } from '../app/components/sky-image-warp.ts';

// With black ink, recolouring cannot turn a red source pixel green. Moving
// green pixels into red cells proves the fallback refracts the source image.
const size = 96;
const source = new Uint8ClampedArray(size * size * 4);
for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
  const offset = (y * size + x) * 4;
  source[offset + (Math.floor(x / 3) % 2)] = 255;
  source[offset + 3] = 255;
}
const saved = source.slice(), output = new Uint8ClampedArray(source.length);
warpSkyImage(source, output, size, size, [], [], [0, 0, 0]);
assert.deepEqual(output, source);
warpSkyImage(source, output, size, size, [{x: .5, y: .5, radius: .25, opacity: 1}], [], [0, 0, 0]);
assert.ok(output.some((value, i) => i % 4 === 1 && value > 30 && source[i] === 0), 'The image must actually move, not just gain an outline');
assert.deepEqual(source, saved, 'Displacement must preserve the original image');

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const url = process.env.HUB_URL || 'http://127.0.0.1:4326/os-joe/home/';
const page = await browser.newPage({ viewport: {width: 1440, height: 1000} });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const renderer = (target, mode) => target.locator(`.galaxy-backdrop[data-ripple-renderer="${mode}"]`).waitFor();
const gpuPixels = target => target.locator('.galaxy-sky').first().evaluate(canvas => {
  const gl = canvas.getContext('webgl2');
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let hash = 2166136261;
  for (const value of pixels) hash = Math.imul(hash ^ value, 16777619);
  return hash;
});
const softwarePixels = target => target.locator('.galaxy-sky').last().evaluate(canvas => {
  const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  let hash = 2166136261;
  for (const value of pixels) hash = Math.imul(hash ^ value, 16777619);
  return hash;
});

try {
  await page.goto(url);
  await page.getByRole('combobox', {name:'Background preset'}).selectOption('pixel');
  await page.waitForFunction(()=>document.querySelector('.galaxy-backdrop')?.dataset.skyPreset==='pixel');
  await renderer(page, 'pixel-warp-webgl');
  assert.equal(await page.getByRole('combobox', { name: 'Background preset' }).inputValue(), 'pixel');
  assert.equal(await page.locator('.galaxy-sky').first().evaluate(canvas => getComputedStyle(canvas).opacity), '1', 'Pixel sky must use the real renderer');
  const baseline = await gpuPixels(page);
  await page.mouse.click(1430, 10);
  await page.waitForTimeout(700);
  assert.notEqual(await gpuPixels(page), baseline, 'A click must bend the default pixel sky');
  await page.mouse.click(1430, 250);
  await page.waitForTimeout(400);
  const count = await page.locator('.galaxy-sky').first().evaluate(canvas => {
    const gl = canvas.getContext('webgl2'), program = gl.getParameter(gl.CURRENT_PROGRAM);
    return gl.getUniform(program, gl.getUniformLocation(program, 'rippleCount'));
  });
  assert.ok(count >= 2, 'Overlapping waves must remain visible together');
  await page.screenshot({ path: '/tmp/joe-pixel-sky-waves.png' });

  await page.getByRole('button', { name: 'CALM', exact: true }).click();
  const calm = await gpuPixels(page);
  await page.mouse.click(1430, 10);
  await page.waitForTimeout(300);
  assert.equal(await gpuPixels(page), calm, 'Calm must stop motion and ignore sky input');
  await page.getByRole('combobox', { name: 'Background preset' }).selectOption('earth');
  assert.notEqual(await gpuPixels(page), calm, 'Earth retains its separate palette');
  await page.getByRole('button', { name: 'WAKE SKY', exact: true }).click();
  const earth = await gpuPixels(page);
  await page.waitForTimeout(500);
  assert.notEqual(await gpuPixels(page), earth, 'Earth still animates');
  await page.getByRole('combobox', { name: 'Background preset' }).selectOption('pixel');
  await page.reload();
  await renderer(page, 'pixel-warp-webgl');
  assert.equal(await page.getByRole('combobox', { name: 'Background preset' }).inputValue(), 'pixel');

  await page.locator('.galaxy-sky').first().evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await renderer(page, 'pixel-warp-2d');
  const fallback = await softwarePixels(page);
  await page.mouse.click(1430, 10);
  await page.waitForTimeout(500);
  assert.notEqual(await softwarePixels(page), fallback, 'Context loss must retain image displacement');

  const phone = await browser.newPage({ viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true });
  phone.on('pageerror', error => errors.push(error.message));
  await phone.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl2' ? null : getContext.call(this, type, ...args);
    };
  });
  await phone.goto(url);
  await phone.getByRole('combobox', {name:'Background preset'}).selectOption('pixel');
  await phone.waitForFunction(()=>document.querySelector('.galaxy-backdrop')?.dataset.skyPreset==='pixel');
  await renderer(phone, 'pixel-warp-2d');
  const phoneBefore = await softwarePixels(phone);
  await phone.touchscreen.tap(2, 2);
  await phone.waitForTimeout(500);
  assert.notEqual(await softwarePixels(phone), phoneBefore, 'Touch without WebGL must still warp the image');
  await phone.screenshot({ path: '/tmp/joe-pixel-sky-software-mobile.png' });
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto(url);
  await reduced.getByRole('combobox', {name:'Background preset'}).selectOption('pixel');
  await reduced.waitForFunction(()=>document.querySelector('.galaxy-backdrop')?.dataset.skyPreset==='pixel');
  await renderer(reduced, 'pixel-warp-webgl');
  await reduced.getByRole('button', { name: 'WAKE SKY', exact: true }).waitFor();
  const still = await gpuPixels(reduced);
  await reduced.mouse.click(1430, 10);
  await reduced.waitForTimeout(200);
  assert.equal(await gpuPixels(reduced), still, 'Reduced motion remains calm by default');
  assert.deepEqual(errors, []);
  console.log('PASS: real source-pixel displacement, default Pixel WebGL waves, overlapping clicks, Earth palette/motion, saved preset, calm, reduced motion, context-loss and mobile software fallback.');
} finally {
  await browser.close();
}
