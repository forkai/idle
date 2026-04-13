/**
 * @fileoverview UI布局验证 E2E 测试
 * @description 检测常见UI错乱问题：元素重叠、溢出、不可见等
 *
 * 运行方式：
 *   npm run test:e2e -- tests/e2e/ui-layout.spec.ts
 *   npm run test:e2e:headed -- tests/e2e/ui-layout.spec.ts
 */

import { test, expect, Page } from '@playwright/test'

/**
 * 辅助函数：检测元素是否在视口内可见（不存在溢出）
 */
async function isElementInViewport(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }, selector)
}

/**
 * 辅助函数：获取元素的溢出情况
 */
async function hasOverflow(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return false
    return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
  }, selector)
}

/**
 * 辅助函数：获取元素实际尺寸
 */
async function getElementSize(page: Page, selector: string): Promise<{ width: number; height: number }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { width: 0, height: 0 }
    const rect = el.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }, selector)
}

test.describe('UI布局验证', () => {
  // 快速创建角色进入游戏主界面
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const nameInput = page.locator('input[type="text"]').first()
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('测试角色')
      await page.getByRole('button', { name: /创建|开始/i }).click()
      await page.waitForURL('**/', { timeout: 5000 })
    }
  })

  test('1. 顶部导航栏可见且在视口顶部', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // 导航栏应在页面顶部（top < 10px）
    const top = await header.evaluate((el) => el.getBoundingClientRect().top)
    expect(top).toBeLessThan(10)
  })

  test('2. 三个导航标签按钮可见且可点击', async ({ page }) => {
    const navButtons = page.locator('header button')
    const count = await navButtons.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // 每个按钮都可见
    for (let i = 0; i < count; i++) {
      await expect(navButtons.nth(i)).toBeVisible()
    }
  })

  test('3. 左侧状态栏没有溢出', async ({ page }) => {
    const statusBar = page.locator('aside').first()
    await expect(statusBar).toBeVisible()

    // 状态栏应在视口内（不溢出右边）
    const inViewport = await isElementInViewport(page, 'aside:first-child')
    expect(inViewport).toBe(true)

    // 状态栏宽度应大于0
    const size = await getElementSize(page, 'aside:first-child')
    expect(size.width).toBeGreaterThan(0)
  })

  test('4. 区域选择侧边栏没有溢出', async ({ page }) => {
    const zoneSection = page.locator('aside').last()
    await expect(zoneSection).toBeVisible()

    // 区域选择应在视口内
    const inViewport = await isElementInViewport(page, 'aside:last-child')
    expect(inViewport).toBe(true)

    // 没有水平溢出
    const overflow = await hasOverflow(page, 'aside:last-child')
    expect(overflow).toBe(false)
  })

  test('5. 区域选择卡片没有溢出容器', async ({ page }) => {
    const zoneCards = page.locator('aside:last-child button')
    const count = await zoneCards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const card = zoneCards.nth(i)
      await expect(card).toBeVisible()

      // 每个卡片应在视口内
      const cardInViewport = await isElementInViewport(page, `aside:last-child button:nth-child(${i + 1})`)
      expect(cardInViewport).toBe(true)
    }
  })

  test('6. 战斗区域没有溢出', async ({ page }) => {
    const combatSection = page.locator('section').first()
    await expect(combatSection).toBeVisible()

    const inViewport = await isElementInViewport(page, 'section')
    expect(inViewport).toBe(true)
  })

  test('7. 底部footer在视口底部附近', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    const rect = await footer.evaluate((el) => el.getBoundingClientRect())
    const viewportHeight = page.viewportSize()?.height ?? 800

    // footer底部应在视口底部或稍上方（50px以内）
    expect(rect.bottom).toBeLessThan(viewportHeight + 50)
  })

  test('8. 切换到背包标签，面板正常显示', async ({ page }) => {
    // 点击背包标签
    await page.getByText('🎒').click()
    await page.waitForTimeout(300)

    // 背包面板应可见
    await expect(page.getByText('背包')).toBeVisible()
  })

  test('9. 切换到技能标签，面板正常显示', async ({ page }) => {
    // 点击技能标签
    await page.getByText('⚡').click()
    await page.waitForTimeout(300)

    // 技能面板应可见
    await expect(page.getByText('技能')).toBeVisible()
  })

  test('10. 所有文本可读（没有过小的字号）', async ({ page }) => {
    // 查找所有文本元素
    const textElements = page.locator('p, span, h1, h2, h3, h4, button')
    const count = await textElements.count()

    for (let i = 0; i < Math.min(count, 50); i++) {
      const el = textElements.nth(i)
      if (!(await el.isVisible())) continue

      const fontSize = await el.evaluate((e) => {
        const style = window.getComputedStyle(e)
        return parseFloat(style.fontSize)
      })

      // 字体大小应 >= 10px（可读最小值）
      expect(fontSize).toBeGreaterThanOrEqual(10)
    }
  })

  test('11. 区域选择内没有元素重叠（通过检测元素边界）', async ({ page }) => {
    const cards = page.locator('aside:last-child button')
    const count = await cards.count()

    // 获取所有卡片的边界
    const boundingBoxes = await Promise.all(
      Array.from({ length: count }, (_, i) => cards.nth(i).boundingBox())
    )

    // 检查卡片没有完全重叠
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const a = boundingBoxes[i]
        const b = boundingBoxes[j]
        if (!a || !b) continue

        // 检查是否有重叠区域（两个卡片都在同一点有内容）
        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))

        const overlapArea = overlapX * overlapY

        // 重叠面积不应超过较小卡片的80%
        const minArea = Math.min(a.width * a.height, b.width * b.height)
        if (minArea > 0) {
          expect(overlapArea / minArea).toBeLessThan(0.8)
        }
      }
    }
  })

  test('12. 控制台无Error级别日志', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.reload()
    await page.waitForTimeout(1000)

    // 过滤掉常见的无害错误（如favicon）
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR')
    )

    expect(realErrors).toHaveLength(0)
  })
})
