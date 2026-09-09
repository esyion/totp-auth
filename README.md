# @esyion/totp-auth

[![npm version](https://badge.fury.io/js/@esyion%2Ftotp-auth.svg)](https://www.npmjs.com/package/@esyion/totp-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 RFC 6238/4226 标准的 TOTP/HOTP 实现，兼容 Google Authenticator，同时输出 ESM 和 CommonJS 双格式，零运行时依赖。

> **项目来源**：本项目复刻自 [`@krmeow/totp-auth`](https://www.npmjs.com/package/@krmeow/totp-auth)（MIT License, Copyright (c) 2024 krmeow），在其基础上补齐了 TypeScript 源码工程、RFC 标准测试向量测试套件与构建配置，并修复了 `generateSecret` 的 Node 降级路径。感谢原作者 krmeow 的贡献。

## 特性

- 完整的 TOTP/HOTP 实现（RFC 6238 / RFC 4226）
- TypeScript 编写，附带完整类型声明
- 支持 SHA-1、SHA-256、SHA-512 算法
- 支持自定义时间步进和密码位数
- 支持时间窗口容错验证
- 同时输出 ESM 和 CommonJS 格式
- 零运行时依赖
- 通过 RFC 4648 / 4226 / 6238 官方测试向量验证

## 安装

```bash
npm install @esyion/totp-auth
```

## 快速开始

```typescript
import { TOTP } from '@esyion/totp-auth';

// 1. 生成密钥
const secret = TOTP.generateSecret();
console.log('Secret:', secret);

// 2. 创建 TOTP 实例（使用 Base32 解码后的密钥）
const totp = new TOTP(TOTP.base32Decode(secret));

// 3. 生成验证码
const code = totp.generate();
console.log('Code:', code);

// 4. 验证（支持时间窗口容错）
const isValid = totp.verify(code, { window: 1 });
console.log('Valid:', isValid);

// 5. 获取验证码剩余有效时间
const remaining = totp.getRemainingSeconds();
console.log('Remaining seconds:', remaining);

// 6. 生成 Google Authenticator 扫码 URI
const uri = TOTP.generateAuthURI('user@example.com', secret, 'MyApp');
console.log('Auth URI:', uri);
```

## API

### TOTP 类

#### `new TOTP(key, options?)`

创建 TOTP 实例。

- `key`: `Uint8Array` - Base32 解码后的密钥
- `options`:
  - `timeStep`: 时间步进（秒），默认 30
  - `digits`: 验证码位数，默认 6
  - `algorithm`: 哈希算法 `'SHA-1' | 'SHA-256' | 'SHA-512'`，默认 `'SHA-1'`

#### `generate(timestamp?)`

生成验证码。

- `timestamp`: 可选时间戳（`Date` 或毫秒数），默认当前时间

#### `verify(code, options?)`

验证验证码。

- `code`: 要验证的验证码（字符串或数字）
- `options`:
  - `timestamp`: 验证时间，默认当前时间
  - `window`: 容错窗口（前后几个时间步进），默认 1

#### `getRemainingSeconds(timestamp?)`

获取验证码剩余有效时间。

- `timestamp`: 可选时间戳，默认当前时间
- 返回: 剩余秒数

#### `TOTP.generateSecret(bytes?)`

生成随机密钥。

- `bytes`: 密钥字节数，默认 20
- 返回: Base32 编码的密钥字符串

#### `TOTP.generateAuthURI(account, secret, issuer?)`

生成 Google Authenticator 扫码 URI。

- `account`: 账户名（如邮箱）
- `secret`: Base32 编码的密钥
- `issuer`: 可选服务商名称
- 返回: `otpauth://` URI 字符串

#### `TOTP.base32Decode(encoded)`

Base32 解码。

- `encoded`: Base32 编码的字符串
- 返回: `Uint8Array`

### HOTP 类

HOTP 是基于计数器的 OTP 实现，TOTP 基于 HOTP 构建。

#### `new HOTP(key, options?)`

创建 HOTP 实例，`options` 支持 `digits` 与 `algorithm`。

#### `generate(counter)`

生成 HOTP 验证码。

- `counter`: 计数器值

#### `validate(code, counter, window?)`

验证 HOTP 验证码。

- 返回: `{ valid: boolean; counter?: number }`

### Base32 类

#### `Base32.encode(data)`

Base32 编码。

- `data`: `Uint8Array`
- 返回: Base32 编码字符串

#### `Base32.decode(encoded)`

Base32 解码。

- `encoded`: Base32 编码字符串
- 返回: `Uint8Array`

## 与 Google Authenticator 配合使用

```typescript
import { TOTP } from '@esyion/totp-auth';

// 生成密钥
const secret = TOTP.generateSecret();

// 生成扫码 URI，将其渲染为二维码，用户扫码即可绑定
const uri = TOTP.generateAuthURI('user@example.com', secret, 'MyApp');
```

## 运行环境说明

HMAC 计算依赖 Node.js 内置 `crypto` 模块，请在 Node.js（≥ 14）或已配置 node polyfill 的打包环境中使用。

## 测试向量

本库使用 RFC 6238 标准测试向量验证（使用 8 位验证码，SHA-1）：

| 时间戳（秒） | 预期验证码 |
|-------------|-----------|
| 59 | 94287082 |
| 1111111109 | 07081804 |
| 1111111111 | 14050471 |
| 1234567890 | 89005924 |
| 2000000000 | 69279037 |
| 20000000000 | 65353130 |

同时覆盖 RFC 4226（HOTP）与 RFC 4648（Base32）的官方测试向量。

> **注意**：RFC 6238 标准测试向量使用 8 位验证码。实际使用中（如 Google Authenticator），默认使用 **6 位验证码**，这也是本库的默认值。

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建（输出 ESM / CJS / 类型声明到 dist/）
npm run build
```

## 发布

```bash
npm login
npm publish --access public
```

> scoped 包（`@xxx/yyy`）首次发布需要 `--access public`。

## 许可证

MIT License —— 详见 [LICENSE](LICENSE)。本项目基于 [@krmeow/totp-auth](https://www.npmjs.com/package/@krmeow/totp-auth)（MIT）复刻，保留了原作者版权声明。
