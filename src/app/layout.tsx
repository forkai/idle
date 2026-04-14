/**
 * @fileoverview 根布局组件
 * @description 定义应用的全局布局和元数据
 */

import type { Metadata, Viewport } from "next"
import "./globals.css"
import { GameSoundProvider } from "@/components/game/GameSoundProvider"

export const metadata: Metadata = {
  title: "Diablo Idle - 暗黑破坏神风格放置游戏",
  description: "一款融合暗黑破坏神经典元素的放置类挂机游戏",
  keywords: ["游戏", "放置游戏", "暗黑破坏神", "RPG", "idle"],
  authors: [{ name: "Diablo Idle Team" }],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <GameSoundProvider />
      </body>
    </html>
  )
}
