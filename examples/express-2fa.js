// Express + 两步验证（2FA）完整接入示例（参考实现，非可直接运行）
//
// 依赖：npm install express qrcode @esyion/totp-auth
// 数据库表假设：users(id, email, password_hash, totp_secret, totp_enabled)
//
// 流程：
//   ① POST /2fa/setup    登录用户开启两步验证 → 返回二维码数据 URL
//   ② POST /2fa/confirm  用户输入手机上的 6 位码确认绑定
//   ③ POST /login        密码校验通过后，再校验一次性验证码
import express from 'express';
import QRCode from 'qrcode';
import { TOTP } from '@esyion/totp-auth';

const app = express();
app.use(express.json());

// ── ① 开启两步验证：生成密钥，返回扫码二维码 ──
app.post('/2fa/setup', async (req, res) => {
  const user = await getCurrentUser(req); // 你的会话/鉴权逻辑
  const secret = TOTP.generateSecret();

  await db.users.update(user.id, { totp_secret: secret, totp_enabled: false });

  const uri = TOTP.generateAuthURI(user.email, secret, 'MyApp');
  const qrDataUrl = await QRCode.toDataURL(uri); // 前端 <img src={qrDataUrl}> 展示
  res.json({ qrDataUrl });
});

// ── ② 确认绑定：用户输入 Authenticator 显示的 6 位码 ──
app.post('/2fa/confirm', async (req, res) => {
  const user = await getCurrentUser(req);
  const totp = new TOTP(TOTP.base32Decode(user.totp_secret));

  if (!totp.verify(req.body.code, { window: 1 })) {
    return res.status(400).json({ error: '验证码错误，请重试' });
  }
  await db.users.update(user.id, { totp_enabled: true });
  res.json({ ok: true });
});

// ── ③ 登录：密码通过后，校验一次性验证码 ──
app.post('/login', async (req, res) => {
  const user = await db.users.findByEmail(req.body.email);
  if (!user || !(await verifyPassword(req.body.password, user.password_hash))) {
    return res.status(401).json({ error: '账号或密码错误' });
  }

  if (user.totp_enabled) {
    const totp = new TOTP(TOTP.base32Decode(user.totp_secret));
    if (!totp.verify(req.body.totpCode, { window: 1 })) {
      return res.status(401).json({ error: '两步验证码错误或已过期' });
    }
    // 高安全场景建议在此做防重放：记录并拒绝重复使用同一时间片的验证码
  }

  const token = await createSession(user.id); // 你的会话签发逻辑
  res.json({ token });
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));
