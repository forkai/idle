/**
 * @fileoverview Playwright E2E测试配置
 * @description 为Diablo Idle游戏配置端到端测试环境
 *
 * 运行方式：
 *   npx playwright test                    # 运行所有测试
 *   npx playwright test tests/e2e/         # 只运行E2E测试
 *   npx playwright test --ui               # 交互模式
 *   npx playwright test --headed           # 显示浏览器窗口
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  /** 测试文件目录 */
  testDir: './tests/e2e',

  /** 完整匹配模式 */
  fullyParallel: true,

  /** 失败时重试次数（CI环境可设为2） */
  retries: process.env.CI ? 2 : 0,

  /** 工作线程数 */
  workers: process.env.CI ? 1 : undefined,

  /** 报告器 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /** 全局测试配置 */
  use: {
    /** 基础URL */
    baseURL: 'http://localhost:3000',

    /** 全局超时 */
    timeout: 30_000,

    /** 截图/跟踪配置 */
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',

    /** 视频录制（失败时保留） */
    video: 'retain-on-failure',

    /** 忽略HTTPS错误（本地开发用） */
    ignoreHTTPSErrors: true,
  },

  /** 项目/浏览器配置 */
  projects: [
    /** Chromium（主要测试浏览器） */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /** Firefox */
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    /** Mobile Safari（可选，移动端兼容性测试） */
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /** Web服务器配置（运行测试前自动启动开发服务器） */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },

  /** 输出目录 */
  outputDir: 'test-results/',
})
