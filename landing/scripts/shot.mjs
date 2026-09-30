// QA screenshots with the local Chrome. Scrolls through the page so every in-view animation fires,
// then captures either one section or the full page.
//   node scripts/shot.mjs --url http://localhost:5173 --out /tmp/birth.png --section birth [--width 1440] [--height 900] [--wait 2500]
//   node scripts/shot.mjs --url http://localhost:5173 --out /tmp/full.png --full
import puppeteer from 'puppeteer-core'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true])
    return acc
  }, []),
)
const width = Number(args.width ?? 1440)
const height = Number(args.height ?? 900)
const wait = Number(args.wait ?? 2500)

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width, height, deviceScaleFactor: Number(args.dpr ?? 1) })
page.on('pageerror', (e) => console.error('pageerror:', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()))
await page.goto(args.url ?? 'http://localhost:5173', { waitUntil: 'networkidle0' })

if (args.section) {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ block: 'start' }), args.section)
  await new Promise((r) => setTimeout(r, wait))
  const el = await page.$(`#${args.section}`)
  if (!el) throw new Error(`#${args.section} not found`)
  const box = await el.boundingBox()
  // Sections taller than the viewport: capture the whole section after scrolling through it.
  if (box && box.height > height) {
    for (let y = 0; y < box.height; y += height / 2) {
      await page.evaluate((dy) => window.scrollBy(0, dy), height / 2)
      await new Promise((r) => setTimeout(r, 400))
    }
    await new Promise((r) => setTimeout(r, wait))
  }
  await el.screenshot({ path: args.out })
} else {
  const total = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < total; y += height / 2) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await new Promise((r) => setTimeout(r, 350))
  }
  await new Promise((r) => setTimeout(r, wait))
  if (args.full) await page.screenshot({ path: args.out, fullPage: true })
  else {
    await page.evaluate(() => window.scrollTo(0, 0))
    await new Promise((r) => setTimeout(r, wait))
    await page.screenshot({ path: args.out })
  }
}
await browser.close()
console.log(args.out)
