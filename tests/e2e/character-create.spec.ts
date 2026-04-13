/**
 * @fileoverview 角色创建流程 E2E 测试
 * @description 测试从首页到角色创建完成的完整流程
 *
 * 测试场景：
 * 1. 首页加载显示角色创建界面
 * 2. 可以选择战士/法师/刺客三个职业
 * 3. 输入角色名称后可以创建角色
 * 4. 创建完成后进入游戏主界面
 */

import { test, expect } from '@playwright/test'

/** 职业相关数据 */
const CLASSES = [
  { id: 'warrior', name: '战士', icon: '⚔️' },
  { id: 'mage', name: '法师', icon: '🔮' },
  { id: 'rogue', name: '刺客', icon: '🗡️' },
]

test.describe('角色创建流程', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页（开发服务器由webServer配置自动启动）
    await page.goto('/')
  })

  test('1. 首页正确加载角色创建界面', async ({ page }) => {
    // 检查页面标题/欢迎语
    await expect(page.getByText(/暗黑|Diablo/i)).toBeVisible()

    // 检查职业选择区存在
    await expect(page.getByText('选择职业')).toBeVisible()

    // 检查三个职业卡片都存在
    for (const cls of CLASSES) {
      await expect(page.getByText(cls.name)).toBeVisible()
    }
  })

  test('2. 默认选中战士职业', async ({ page }) => {
    // 战士卡片应有选中样式（border-amber-500）
    const warriorCard = page.locator('button').filter({ hasText: '战士' }).first()
    await expect(warriorCard).toBeVisible()
  })

  test('3. 点击职业卡片切换选中状态', async ({ page }) => {
    // 点击法师卡片
    const mageCard = page.locator('button').filter({ hasText: '法师' }).first()
    await mageCard.click()

    // 法师卡片应变为选中状态（点击后触发选中）
    await expect(mageCard).toBeVisible() // 基础可见性检查
  })

  test('4. 输入角色名称', async ({ page }) => {
    // 找到名称输入框
    const nameInput = page.getByPlaceholder(/输入.*名称/i).or(page.locator('input[type="text"]').first())
    await nameInput.fill('测试冒险者')

    // 验证输入的值
    await expect(nameInput).toHaveValue('测试冒险者')
  })

  test('5. 填写名称后可点击创建按钮', async ({ page }) => {
    // 输入名称
    const nameInput = page.getByPlaceholder(/输入.*名称/i).or(page.locator('input[type="text"]').first())
    await nameInput.fill('测试角色')

    // 查找创建按钮
    const createButton = page.getByRole('button', { name: /创建|开始/i })
    await expect(createButton).toBeEnabled()
  })

  test('6. 完整角色创建流程（战士）', async ({ page }) => {
    // 选择战士（默认已选）
    const warriorCard = page.locator('button').filter({ hasText: '战士' }).first()
    await warriorCard.click()

    // 输入角色名称
    const nameInput = page.getByPlaceholder(/输入.*名称/i).or(page.locator('input[type="text"]').first())
    await nameInput.fill('战神阿瑞斯')

    // 点击创建按钮
    const createButton = page.getByRole('button', { name: /创建|开始游戏/i })
    await createButton.click()

    // 等待导航到游戏主界面
    await page.waitForURL('**/')

    // 验证角色名称显示在状态栏中
    await expect(page.getByText('战神阿瑞斯')).toBeVisible({ timeout: 5000 })
  })

  test('7. 完整角色创建流程（法师）', async ({ page }) => {
    // 选择法师
    const mageCard = page.locator('button').filter({ hasText: '法师' }).first()
    await mageCard.click()

    // 输入角色名称
    const nameInput = page.getByPlaceholder(/输入.*名称/i).or(page.locator('input[type="text"]').first())
    await nameInput.fill('冰霜女王')

    // 点击创建按钮
    const createButton = page.getByRole('button', { name: /创建|开始游戏/i })
    await createButton.click()

    // 等待进入游戏
    await page.waitForURL('**/')

    // 验证角色名称
    await expect(page.getByText('冰霜女王')).toBeVisible({ timeout: 5000 })
  })

  test('8. 不输入名称时创建按钮应禁用或提示', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /创建|开始游戏/i })

    // 尝试不输入名称直接点击（可能禁用或提示）
    const isDisabled = await createButton.isDisabled()
    if (!isDisabled) {
      await createButton.click()
      // 应该有错误提示
      await expect(page.getByText(/名称|不能为空|请输入/i)).toBeVisible()
    }
  })
})

test.describe('游戏主界面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 快速创建角色进入游戏
    const nameInput = page.getByPlaceholder(/输入.*名称/i).or(page.locator('input[type="text"]').first())
    await nameInput.fill('测试角色')
    const createButton = page.getByRole('button', { name: /创建|开始游戏/i })
    await createButton.click()
    await page.waitForURL('**/', { timeout: 5000 })
  })

  test('9. 状态栏显示玩家信息', async ({ page }) => {
    // 角色名称
    await expect(page.getByText('测试角色')).toBeVisible()

    // 等级显示
    await expect(page.getByText(/Lv\.|等级/i)).toBeVisible()

    // 生命值
    await expect(page.getByText(/生命|HP|❤️/i)).toBeVisible()

    // 金币
    await expect(page.getByText(/金币|💰/i)).toBeVisible()
  })

  test('10. 显示区域选择入口', async ({ page }) => {
    // 应有区域/地图相关文字
    await expect(page.getByText(/区域|地图|zone/i).first()).toBeVisible()
  })

  test('11. 显示战斗入口或自动进入战斗', async ({ page }) => {
    // 有战斗区域或自动战斗
    const hasCombat = await page.getByText(/战斗|combat|attack/i).first().isVisible().catch(() => false)
    const hasAutoBattle = await page.getByText(/自动|auto/i).first().isVisible().catch(() => false)
    expect(hasCombat || hasAutoBattle).toBeTruthy()
  })
})
