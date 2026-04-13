# Diablo Idle - 暗黑破坏神风格放置游戏

一款融合暗黑破坏神经典元素的放置类挂机游戏。

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/                  # Next.js App Router
├── components/game/       # 游戏UI组件
├── constants/           # 游戏数据常量
├── data/                # JSON模板数据
├── lib/                 # 业务逻辑
├── stores/             # Zustand状态管理
└── types/              # TypeScript类型
```

## 开发文档

- **开发任务**: [TODO.md](TODO.md) - 唯一的开发计划文档
- **开发准则**: [DEV_GUIDELINES.md](DEV_GUIDELINES.md) - 代码规范
- **Bug追踪**: [BUGS.md](BUGS.md) - Bug记录
- **更新日志**: [CHANGELOG.md](CHANGELOG.md) - 版本历史

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS (暗黑主题)
- **状态**: Zustand (持久化)
- **数据库**: SQL.js (浏览器内运行)
- **测试**: Vitest + Playwright
