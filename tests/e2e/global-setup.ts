/**
 * @fileoverview Playwright 全局设置
 * @description 为所有E2E测试配置全局Hook（截图、登录状态重置等）
 */

import { test as base } from '@playwright/test'

/**
 * 扩展的Fixture类型（可添加自定义fixture）
 */
export { expect } from '@playwright/test'

/**
 * 全局测试配置
 * 所有test()继承此配置
 */
base.use({
  /** 截图失败时保存完整页面 */
  screenshot: 'only-on-failure',

  /** 视频录制 */
  video: 'retain-on-failure',

  /** 追踪信息 */
  trace: 'on-first-retry',
})
