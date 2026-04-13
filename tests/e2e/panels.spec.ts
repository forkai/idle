/**
 * @fileoverview 面板组件 E2E 测试
 * @description 测试背包、技能、装备、图鉴面板的UI和交互
 *
 * 测试场景：
 * 1. 背包面板 - 网格显示、物品操作
 * 2. 技能面板 - 技能树显示、解锁/升级
 * 3. 装备面板 - 人形槽位、背包拖拽
 * 4. 图鉴面板 - 标签切换、发现统计
 */

import { test, expect } from '@playwright/test'

/** 辅助函数：快速创建角色进入游戏 */
async function createCharacterAndEnter(page: any, name = '测试角色') {
  const nameInput = page.getByPlaceholder(/输入.*名称/i).or(page.locator('input[type="text"]').first())
  await nameInput.fill(name)
  const createButton = page.getByRole('button', { name: /创建|开始游戏/i })
  await createButton.click()
  await page.waitForURL('**/', { timeout: 5000 })
  // 等待游戏加载
  await page.waitForTimeout(500)
}

/** 辅助函数：点击导航标签 */
async function clickNavTab(page: any, tabIcon: string) {
  await page.locator('button').filter({ hasText: tabIcon }).first().click()
  await page.waitForTimeout(200)
}

test.describe('导航系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await createCharacterAndEnter(page)
  })

  test('1. 所有导航标签可点击切换', async ({ page }) => {
    const tabs = ['🗺️', '⚔️', '🎒', '⚡', '📖']
    for (const tab of tabs) {
      const tabBtn = page.locator('button').filter({ hasText: tab }).first()
      await expect(tabBtn).toBeVisible()
      await tabBtn.click()
      await page.waitForTimeout(100)
    }
  })

  test('2. 当前激活标签有选中样式', async ({ page }) => {
    // 探索标签默认选中
    const zoneTab = page.locator('button').filter({ hasText: '🗺️' }).first()
    await expect(zoneTab).toHaveClass(/amber|bg-/)
  })
})

test.describe('背包面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await createCharacterAndEnter(page)
    await clickNavTab(page, '🎒')
  })

  test('3. 背包面板标题显示', async ({ page }) => {
    await expect(page.getByText('🎒 背包')).toBeVisible()
  })

  test('4. 背包容量指示器显示', async ({ page }) => {
    // 应显示 "数量/总数" 格式
    const capacity = page.locator('text=/\\d+\\/\\d+/')
    await expect(capacity.first()).toBeVisible()
  })

  test('5. 整理按钮存在可点击', async ({ page }) => {
    const sortBtn = page.getByRole('button', { name: '整理' })
    await expect(sortBtn).toBeVisible()
    await sortBtn.click()
  })

  test('6. 背包网格渲染多个格子', async ({ page }) => {
    // 等待背包网格渲染
    await page.waitForTimeout(300)
    // 背包应有多个格子（默认24格或更多）
    const gridItems = page.locator('[draggable="true"]').or(page.locator('.cursor-grab'))
    const count = await gridItems.count()
    expect(count).toBeGreaterThan(10)
  })
})

test.describe('技能面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await createCharacterAndEnter(page)
    await clickNavTab(page, '⚡')
  })

  test('7. 技能面板标题显示', async ({ page }) => {
    await expect(page.getByText('⚡ 技能')).toBeVisible()
  })

  test('8. 职业标签存在', async ({ page }) => {
    // 战士/法师/刺客标签之一应显示
    const classTab = page.locator('button').filter({ hasText: /战士|法师|刺客/ }).first()
    await expect(classTab).toBeVisible()
  })

  test('9. 技能树层次显示', async ({ page }) => {
    // 至少显示一个技能阶
    const tierText = page.getByText(/第.*层|Tier|tier|阶/)
    await expect(tierText.first()).toBeVisible()
  })
})

test.describe('装备面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await createCharacterAndEnter(page)
    await clickNavTab(page, '⚔️')
  })

  test('10. 装备面板标题显示', async ({ page }) => {
    await expect(page.getByText('⚔️ 装备')).toBeVisible()
  })

  test('11. 人物装备区域存在', async ({ page }) => {
    await expect(page.getByText('👤 人物装备')).toBeVisible()
  })

  test('12. 背包装备区域存在', async ({ page }) => {
    await expect(page.getByText(/🎒 背包|背包装备/).first()).toBeVisible()
  })

  test('13. 移动端快捷槽位显示', async ({ page }) => {
    // 切换到移动端视口
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(200)
    const mobileSlots = page.getByText('快捷槽位')
    await expect(mobileSlots).toBeVisible()
  })
})

test.describe('图鉴面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await createCharacterAndEnter(page)
    await clickNavTab(page, '📖')
  })

  test('14. 图鉴面板标题显示', async ({ page }) => {
    await expect(page.getByText('📖 图鉴')).toBeVisible()
  })

  test('15. 三个标签页都存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: /装备/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /怪物/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /技能/ }).first()).toBeVisible()
  })

  test('16. 切换到怪物图鉴', async ({ page }) => {
    await page.getByRole('button', { name: /怪物/ }).first().click()
    await page.waitForTimeout(200)
    await expect(page.getByText(/已遭遇|怪物/).first()).toBeVisible()
  })

  test('17. 切换到技能图鉴', async ({ page }) => {
    await page.getByRole('button', { name: /技能/ }).first().click()
    await page.waitForTimeout(200)
    await expect(page.getByText(/已解锁|技能/).first()).toBeVisible()
  })

  test('18. 图鉴网格有内容格', async ({ page }) => {
    await page.waitForTimeout(300)
    // 图鉴应有网格项目（装备/怪物/技能格）
    const gridItems = page.locator('[class*="aspect-square"]')
    const count = await gridItems.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('设置面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await createCharacterAndEnter(page)
  })

  test('19. 设置按钮存在', async ({ page }) => {
    await expect(page.getByTitle('设置')).toBeVisible()
  })

  test('20. 点击设置按钮打开设置面板', async ({ page }) => {
    await page.getByTitle('设置').click()
    await page.waitForTimeout(300)
    await expect(page.getByText('⚙️ 设置')).toBeVisible()
  })

  test('21. 设置面板有音效设置', async ({ page }) => {
    await page.getByTitle('设置').click()
    await page.waitForTimeout(300)
    await expect(page.getByText('音效开关')).toBeVisible()
  })

  test('22. 设置面板有关闭按钮', async ({ page }) => {
    await page.getByTitle('设置').click()
    await page.waitForTimeout(300)
    const closeBtn = page.locator('button').filter({ hasText: '✕' }).first()
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    await page.waitForTimeout(200)
    // 设置面板应关闭
    await expect(page.getByText('⚙️ 设置')).not.toBeVisible()
  })

  test('23. 音效开关可切换', async ({ page }) => {
    await page.getByTitle('设置').click()
    await page.waitForTimeout(300)
    const toggle = page.locator('button').filter({ hasClass: /relative.*w-11/ }).first()
    await expect(toggle).toBeVisible()
    await toggle.click()
    await page.waitForTimeout(100)
  })

  test('24. 战斗动画开关存在', async ({ page }) => {
    await page.getByTitle('设置').click()
    await page.waitForTimeout(300)
    await expect(page.getByText('战斗动画')).toBeVisible()
  })

  test('25. 重置设置按钮存在', async ({ page }) => {
    await page.getByTitle('设置').click()
    await page.waitForTimeout(300)
    await expect(page.getByText('重置所有设置为默认值')).toBeVisible()
  })
})
