# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，
版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-09-09

首个开源版本。复刻自 [@krmeow/totp-auth](https://www.npmjs.com/package/@krmeow/totp-auth) v1.0.0（MIT License, Copyright (c) 2024 krmeow），API 与其保持兼容。

### Added

- 还原完整 TypeScript 源码工程（原包仅发布编译产物）
- 测试套件：覆盖 RFC 4648（Base32）、RFC 4226（HOTP）、RFC 6238（TOTP，SHA-1/256/512）官方测试向量，共 65 个用例
- 构建配置：Rollup 同时输出 ESM / CommonJS / 类型声明
- GitHub Actions CI（Node 18 / 20 / 22 矩阵）
- TypeDoc API 文档（`npm run docs`）
- 可运行示例（`examples/`）

### Fixed

- `TOTP.generateSecret()` 的 Node 降级路径：原实现在 ESM 环境下会引用不存在的 `require` 直接抛 `ReferenceError`，且误用 `randomBytes` API；现改为带守卫的 `randomFillSync`，并在无安全随机源时抛出明确错误
