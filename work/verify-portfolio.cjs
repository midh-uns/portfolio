const { spawn } = require('child_process');
const { chromium } = require('playwright');

const root = process.cwd();
const python = `${root}\\env\\Scripts\\python.exe`;
const server = spawn(python, ['manage.py', 'runserver', '127.0.0.1:8010', '--noreload'], {
  cwd: root,
  stdio: 'pipe',
});

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch('http://127.0.0.1:8010/');
      if (response.ok) return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('Django server did not become ready.');
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.goto('http://127.0.0.1:8010/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3300);
  await page.screenshot({ path: 'work/portfolio-desktop.png', fullPage: true });

  const canvasPainted = await page.evaluate(() => {
    const canvas = document.querySelector('#hero-canvas');
    if (!canvas || canvas.hidden || canvas.width === 0 || canvas.height === 0) return false;
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!context) return false;
    const samplePoints = [
      [0.5, 0.5],
      [0.35, 0.45],
      [0.65, 0.45],
      [0.45, 0.65],
      [0.6, 0.62],
    ];
    return samplePoints.some(([x, y]) => {
      const pixels = new Uint8Array(4);
      context.readPixels(Math.floor(canvas.width * x), Math.floor(canvas.height * y), 1, 1, context.RGBA, context.UNSIGNED_BYTE, pixels);
      return pixels.some((value) => value > 0);
    });
  });

  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.1, behavior: 'instant' }));
  await page.waitForTimeout(600);
  const introVisible = await page.locator('#intro').isVisible();
  const codeReelVisible = await page.locator('.coding-reel').isVisible();
  const educationVisible = await page.locator('#education').isVisible();
  const hasEducationContent = await page.getByText('Higher Secondary Education - 12th').isVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8010/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3300);
  await page.screenshot({ path: 'work/portfolio-mobile.png', fullPage: true });
  const mobileHasNoHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

  await browser.close();
  console.log(JSON.stringify({
    canvasPainted,
    introVisible,
    codeReelVisible,
    educationVisible,
    hasEducationContent,
    mobileHasNoHorizontalOverflow,
  }, null, 2));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    server.kill();
  });
