# 贡献指南

感谢关注本项目！欢迎通过 Issue 报告问题、通过 Pull Request 贡献代码。

## 环境要求

- Node.js ≥ 18
- npm ≥ 9

## 快速上手

```bash
git clone https://github.com/esyion/totp-auth.git
cd totp-auth
npm install

npm test          # 运行测试（65 个用例，含 RFC 标准测试向量）
npm run build     # 构建产物到 dist/（ESM + CJS + 类型声明）
npm run docs      # 生成 API 参考手册到 documentation/（TypeDoc）
```

## 目录结构

```
├── src/              # TypeScript 源码
│   ├── types.ts      # 公共类型定义
│   ├── base32.ts     # RFC 4648 Base32 编解码
│   ├── hotp.ts       # RFC 4226 HOTP
│   ├── totp.ts       # RFC 6238 TOTP（基于 HOTP）
│   └── index.ts      # 入口，统一导出
├── __tests__/        # Jest 测试（RFC 标准测试向量）
├── examples/         # 可运行示例
├── dist/             # 构建产物（不入库）
└── documentation/    # TypeDoc 生成文档（不入库）
```

## 开发规范

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```
feat: 支持自定义 Base32 字母表
fix: 修复 xxx 边界条件
docs: 补充示例
test: 增加 SHA-3 用例
```

### 测试要求

- **RFC 测试向量不可破坏**：`__tests__/` 中基于 RFC 4648/4226/6238 的用例是行为基准，任何改动后必须保持通过
- 新增行为必须附带测试；修复缺陷时先写能复现问题的测试
- ESM 与 CJS 双产物行为需保持一致，涉及关键路径时用 `node` 分别对 `dist/index.esm.js` 与 `dist/index.cjs` 做冒烟验证

### 兼容性

- 公共 API（导出的类、方法签名、类型）变更属于破坏性变更，需升 major 版本并在 CHANGELOG 中说明
- 保持零运行时依赖

## 提交 Pull Request

1. Fork 后从 `main` 拉出特性分支
2. 确保 `npm test` 与 `npm run build` 通过（CI 会跑 Node 18/20/22 矩阵）
3. 如有行为变化，更新 README 与 CHANGELOG（`Unreleased` 段）
4. 提交 PR 并描述变更动机

## 发布流程（维护者）

```bash
npm version <patch|minor|major>   # 更新版本号并打 tag
npm publish --access public       # scoped 包首次发布必须加 --access public
git push --follow-tags
```

## License

贡献的代码将随本项目以 [MIT](LICENSE) 许可证发布。
