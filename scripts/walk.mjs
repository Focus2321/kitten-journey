// QA walkthrough: scrolls the real page like a visitor and saves a viewport frame every `--step` px,
// so pinned and scroll-linked sections are captured as they actually look.
//   node scripts/walk.mjs --url http://localhost:5173 --out /tmp/walk --width 1440 --height 900 [--step 700] [--settle 900]
import { mkdirSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true])
    return acc
  }, []),
)
const width = Number(args.width ?? 1440)
const height = Number(args.height ?? 900)
const step = Number(args.step ?? Math.round(height * 0.8))
const settle = Number(args.settle ?? 900)
const out = args.out ?? '/tmp/walk'
mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width, height })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()))
await page.goto(args.url ?? 'http://localhost:5173', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1800))

const total = await page.evaluate(() => document.documentElement.scrollHeight)
let i = 0
for (let y = 0; y <= total - height + step; y += step) {
  // Small increments so scroll-linked values and whileInView see a realistic scroll.
  await page.evaluate(async (target) => {
    const start = window.scrollY
    for (let k = 1; k <= 8; k++) {
      window.scrollTo(0, start + ((target - start) * k) / 8)
      await new Promise((r) => requestAnimationFrame(() => r()))
    }
  }, Math.min(y, total - height))
  await new Promise((r) => setTimeout(r, settle))
  await page.screenshot({ path: `${out}/${String(i++).padStart(2, '0')}.png` })
}
console.log(`${i} frames → ${out}`)
await browser.close()
