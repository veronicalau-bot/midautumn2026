import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000)
  await page.route('https://docs.google.com/spreadsheets/**', async (route) => {
    await route.fulfill({
      contentType: 'text/csv; charset=utf-8',
      body: 'Title ,Link,Cover,Type\n運動與健康,https://lib.hkapa.edu/bib/test-ebook,https://example.com/ebook.jpg,eBook\n香港散步學,https://lib.hkapa.edu/bib/test-physical,,Physical Book',
    })
  })
  await page.goto('/')
})

test('renders all core experiences and the waterfront map', async ({ page }, testInfo) => {
  await expect(page).toHaveTitle('跑走月餅 Running Off the Mooncake')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('跑走月餅 Running Off the Mooncake')
  await expect(page.getByRole('heading', { name: '夜跑安全注意' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '圖書館資源' })).toBeVisible()
  await expect(page.getByText('演藝學院圖書館', { exact: true })).toBeVisible()
  await expect(page.getByText('中秋健康企劃')).toHaveCount(0)
  await expect(page.getByText('如有嚴重不適或緊急情況，請致電 999。')).toHaveCount(0)
  await expect(page.locator('.hero-actions').getByRole('link', { name: '查看海濱' })).toHaveAttribute('href', '#routes')
  await expect(page.locator('.hero-actions').getByRole('link', { name: '圖書館資源' })).toHaveAttribute('href', '#library')
  await expect(page.locator('.hero-actions').getByRole('link', { name: '電子賀卡' })).toHaveAttribute('href', '#e-card')
  await expect(page.locator('.site-header nav a[href="#library"]')).toHaveText('圖書館資源')
  await expect(page.locator('.site-header nav a[href="#e-card"]')).toHaveText('電子賀卡')
  await expect(page.locator('#journey')).toBeVisible()
  await expect(page.locator('#routes')).toBeVisible()
  await expect(page.locator('#safety')).toBeVisible()
  await expect(page.locator('#calculator')).toBeVisible()
  await expect(page.locator('#library')).toBeVisible()
  await expect(page.locator('#e-card')).toBeVisible()
  await page.locator('#routes').scrollIntoViewIfNeeded()
  const mapEmbed = page.locator('.google-map-embed')
  await expect(mapEmbed).toBeVisible()
  await expect(mapEmbed).toHaveCSS('pointer-events', 'none')
  await expect(page.getByRole('link', { name: '在 Google Maps 開啟' })).toHaveAttribute('target', '_blank')
  await page.screenshot({ path: testInfo.outputPath('full-page.png'), fullPage: true })
})

test('switches language and updates the local calculator', async ({ page }) => {
  await page.getByRole('button', { name: /EN/ }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('跑走月餅 Running Off the Mooncake')
  await expect(page.locator('#top .eyebrow')).toHaveText('Academy Libraries')
  await expect(page.getByText('College Library')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Send a Mid-Autumn e-card' })).toBeVisible()
  const heroLayout = await page.locator('.hero-section').evaluate((hero) => {
    const actions = hero.querySelector('.hero-actions')
    const title = hero.querySelector('.hero-title-en')
    if (!actions || !title) return null
    return {
      actionsBottom: actions.getBoundingClientRect().bottom,
      heroBottom: hero.getBoundingClientRect().bottom,
      titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
    }
  })
  expect(heroLayout).not.toBeNull()
  expect(heroLayout!.actionsBottom).toBeLessThanOrEqual(heroLayout!.heroBottom)
  await page.locator('#calculator').scrollIntoViewIfNeeded()
  const inputs = page.locator('.calculator-inputs input')
  await inputs.nth(0).fill('70')
  await inputs.nth(1).fill('60')
  await inputs.nth(2).fill('8')
  await expect(page.locator('.calorie-result > strong')).toHaveText('595')
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasOverflow).toBe(false)
})

test('loads library records from the published CSV fields', async ({ page }) => {
  const library = page.locator('#library')
  await expect(library.locator('.book-card')).toHaveCount(2)
  const ebook = library.locator('.book-card').filter({ hasText: '運動與健康' })
  await expect(ebook).toContainText('電子書')
  await expect(ebook.locator('img')).toHaveAttribute('src', 'https://example.com/ebook.jpg')
  await expect(ebook.getByRole('link', { name: '查看資源' })).toHaveAttribute('href', 'https://lib.hkapa.edu/bib/test-ebook')
  await expect(library.locator('.book-card').filter({ hasText: '香港散步學' })).toContainText('實體書')
})

test('uses location-neutral third e-card greetings in both languages', async ({ page }) => {
  const ecard = page.locator('#e-card')
  await expect(ecard.getByRole('button', { name: '共賞月色，共享團圓時光。' })).toBeVisible()
  await page.getByRole('button', { name: 'EN' }).click()
  await expect(ecard.getByRole('button', { name: 'Wishing you a joyful Mid-Autumn under the moonlight.' })).toBeVisible()
})

test('opens a direct e-card URL at the e-card section after library loading', async ({ page }) => {
  await page.goto('/#e-card')
  await expect(page.locator('#library .book-card')).toHaveCount(2)
  await expect.poll(() => page.locator('#e-card').evaluate((element) => element.getBoundingClientRect().top)).toBeLessThan(100)
})

test('renders and updates the e-card canvas locally', async ({ page }) => {
  const section = page.locator('#e-card')
  const canvas = section.locator('canvas')

  await expect(section.getByRole('heading', { name: '送上一張中秋電子賀卡' })).toBeVisible()
  const sourceDimensions = await page.evaluate(() => new Promise<{ width: number, height: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Unable to load e-card artwork'))
    image.src = '/05_15_53.png'
  }))
  await expect.poll(() => canvas.evaluate((element) => ({ width: element.width, height: element.height }))).toMatchObject({ width: sourceDimensions.width })
  const initialCanvas = await canvas.evaluate((element) => {
    const context = element.getContext('2d')
    if (!context) return { height: 0, checksum: 0 }
    const pixels = context.getImageData(0, 0, element.width, element.height).data
    let checksum = 0
    for (let index = 0; index < pixels.length; index += 4093) checksum = (checksum + pixels[index]) % 1000000007
    return { height: element.height, checksum }
  })
  expect(initialCanvas.height).toBeGreaterThan(sourceDimensions.height)
  expect(initialCanvas.checksum).toBeGreaterThan(0)
  const logoPixels = await canvas.evaluate((element) => {
    const context = element.getContext('2d')
    if (!context) return 0
    const region = context.getImageData(Math.floor(element.width * 0.72), element.height - 150, Math.floor(element.width * 0.25), 120).data
    let coloredPixels = 0
    for (let index = 0; index < region.length; index += 4) {
      if (region[index + 1] > region[index] + 15 || region[index] < 100) coloredPixels += 1
    }
    return coloredPixels
  })
  expect(logoPixels).toBeGreaterThan(100)

  const greeting = section.getByLabel('自訂祝福語')
  await greeting.fill('願月光照亮你每一段旅程。')
  await section.getByLabel('署名').fill('Academy Libraries')
  await expect(greeting).toHaveValue('願月光照亮你每一段旅程。')
  await expect.poll(() => canvas.evaluate((element) => {
    const context = element.getContext('2d')
    if (!context) return 0
    const pixels = context.getImageData(0, 0, element.width, element.height).data
    let checksum = 0
    for (let index = 0; index < pixels.length; index += 4093) checksum = (checksum + pixels[index]) % 1000000007
    return checksum
  })).not.toBe(initialCanvas.checksum)

  await section.getByRole('button', { name: '重新填寫' }).click()
  await expect(greeting).toHaveValue('月圓人團圓，祝你中秋快樂、身心安康。')
  await expect(section.getByLabel('署名')).toHaveValue('')
})

test('downloads the generated e-card as a PNG', async ({ page }) => {
  const section = page.locator('#e-card')
  const downloadPromise = page.waitForEvent('download')
  await section.getByRole('button', { name: '下載賀卡' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('moonlit-mid-autumn-card.png')
  const filePath = await download.path()
  expect(filePath).not.toBeNull()
  const bytes = await readFile(filePath!)
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
})

test('shows the e-card preview before the editor on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This layout rule applies only to mobile.')
  const positions = await page.locator('#e-card .ecard-preview, #e-card .ecard-editor').evaluateAll((elements) => elements.map((element) => ({ className: element.className, top: element.getBoundingClientRect().top })))
  expect(positions[0].className).toBe('ecard-editor')
  expect(positions[1].className).toBe('ecard-preview')
  expect(positions[1].top).toBeLessThan(positions[0].top)
})

test('shows the floating back-to-top control after scrolling', async ({ page }) => {
  const button = page.getByRole('button', { name: '回到最上' })
  await expect(button).not.toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(button).toBeVisible()
  await button.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10)
  await expect(page.getByText('學院圖書館 · 示範版本')).toHaveCount(0)
})

test('opens the supplied Google Maps directions for each updated route', async ({ page }) => {
  await page.locator('#routes').scrollIntoViewIfNeeded()
  const openRouteLink = page.locator('.route-detail .text-link').first()
  const routeLinks = [
    ['尖沙咀海濱', 'Clock+Tower', 'Hung+Hom+Ferry+Pier'],
    ['北角東岸公園', 'Coast+Park+Precinct', 'North+Point+Ferry+Pier'],
    ['觀塘海濱花園至啟德', 'Kwun+Tong+Promenade', 'Kai+Tak+Cruise+Terminal'],
    ['荃灣海濱', 'Tsuen+Wan+Riviera+Park', 'Belvedere+Garden'],
    ['沙田城門河', '22.3818,114.191', 'Sha+Tin+Park'],
  ]

  for (const [routeName, origin, destination] of routeLinks) {
    await page.locator('.route-tabs').getByRole('button', { name: routeName, exact: true }).click()
    const href = await openRouteLink.getAttribute('href')
    expect(href).toContain(origin)
    expect(href).toContain(destination)
    await expect(openRouteLink).toHaveAttribute('target', '_blank')
  }
})

test('renders a locked Google Maps embed for every waterfront route', async ({ page }) => {
  await page.locator('#routes').scrollIntoViewIfNeeded()
  const routeTabs = page.locator('.route-tabs button')

  await expect(routeTabs).toHaveCount(6)
  for (let index = 0; index < 6; index += 1) {
    await routeTabs.nth(index).click()
    const mapEmbed = page.locator('.google-map-embed')
    await expect(mapEmbed).toBeVisible()
    await expect(mapEmbed).toHaveAttribute('src', /^https:\/\/www\.google\.com\/maps\/embed\?pb=/)
    await expect(mapEmbed).toHaveCSS('pointer-events', 'none')
    await expect(page.locator('.map-placeholder')).toHaveCount(0)
  }
})

test('uses the revised distances to estimate full-mooncake route repetitions', async ({ page }) => {
  const journey = page.locator('#journey')
  await expect(journey.getByRole('heading', { name: '吃一個月餅，要慢跑海濱多少次？' })).toBeVisible()

  const expectedRoutes = [
    ['尖沙咀海濱', '2.9 公里', '約4.5次'],
    ['中環至灣仔／東岸公園', '4.4 公里', '約3.0次'],
    ['北角東岸公園', '2.3 公里', '約5.7次'],
    ['觀塘海濱花園至啟德', '3 公里', '約4.4次'],
    ['荃灣海濱', '2.3 公里', '約5.7次'],
    ['沙田城門河', '3.9 公里', '約3.4次'],
  ]

  for (const [routeName, distance, repetitions] of expectedRoutes) {
    const result = journey.getByRole('button', { name: new RegExp(routeName) })
    await expect(result).toContainText(distance)
    await expect(result).toContainText(repetitions)
  }
})

test('changing jogging speed changes route time but not route repetitions', async ({ page }) => {
  const journey = page.locator('#journey')
  const speed = journey.locator('input[type="range"]').nth(1)
  const tsimShaTsui = journey.getByRole('button', { name: /尖沙咀海濱/ })

  await speed.fill('6')
  await expect(tsimShaTsui).toContainText('29 分鐘')
  await expect(tsimShaTsui).toContainText('約4.5次')

  await speed.fill('10')
  await expect(tsimShaTsui).toContainText('17 分鐘')
  await expect(tsimShaTsui).toContainText('約4.5次')
})