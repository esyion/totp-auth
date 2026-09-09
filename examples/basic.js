// 基础用法：生成密钥 → 生成验证码 → 校验 → 剩余时间
//
// 运行方式（仓库内）：
//   npm install && npm run build
//   node examples/basic.js
//
// 通过 npm 安装后，把 import 来源改为 '@esyion/totp-auth' 即可。
import { TOTP } from '../dist/index.esm.js';

// 1. 生成密钥（Base32 字符串，实际项目中保存到用户表）
const secret = TOTP.generateSecret();
console.log('密钥:', secret);

// 2. 创建 TOTP 实例
const totp = new TOTP(TOTP.base32Decode(secret));

// 3. 生成当前验证码（模拟用户手机上显示的码）
const code = totp.generate();
console.log('验证码:', code);

// 4. 校验（window: 1 = 容忍前后各一个 30 秒时间步的时钟偏差）
console.log('校验结果:', totp.verify(code, { window: 1 }));

// 5. 当前验证码剩余有效秒数
console.log('剩余秒数:', totp.getRemainingSeconds());

// 6. 生成 Google Authenticator 扫码 URI（配二维码库使用）
console.log('扫码 URI:', TOTP.generateAuthURI('alice@example.com', secret, 'MyApp'));
