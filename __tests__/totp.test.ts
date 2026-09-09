import { TOTP } from '../src';

const enc = (s: string) => new TextEncoder().encode(s);

// RFC 6238 附录 B 使用的 ASCII 种子
const sha1Key = enc('12345678901234567890');
const sha256Key = enc('1234567890123456789012345678901234567890123456789012345678901234'.slice(0, 32));
const sha512Key = enc('1234567890123456789012345678901234567890123456789012345678901234');

const TIMES = [59, 1111111109, 1111111111, 1234567890, 2000000000, 20000000000];
const SHA1_CODES = ['94287082', '07081804', '14050471', '89005924', '69279037', '65353130'];
const SHA256_CODES = ['46119246', '68084774', '67062674', '91819424', '90698825', '77737706'];
const SHA512_CODES = ['90693936', '25091201', '99943326', '93441116', '38618901', '47863826'];

describe('TOTP（RFC 6238 附录 B 测试向量，8 位验证码）', () => {
  const rows = (codes: string[]): Array<[number, string]> =>
    TIMES.map((t, i) => [t, codes[i]] as [number, string]);

  it.each(rows(SHA1_CODES))('SHA-1 T=%i → %s', (t, code) => {
    expect(new TOTP(sha1Key, { digits: 8 }).generate(t * 1000)).toBe(code);
  });

  it.each(rows(SHA256_CODES))('SHA-256 T=%i → %s', (t, code) => {
    expect(new TOTP(sha256Key, { digits: 8, algorithm: 'SHA-256' }).generate(t * 1000)).toBe(code);
  });

  it.each(rows(SHA512_CODES))('SHA-512 T=%i → %s', (t, code) => {
    expect(new TOTP(sha512Key, { digits: 8, algorithm: 'SHA-512' }).generate(t * 1000)).toBe(code);
  });
});

describe('TOTP 行为', () => {
  const secret = TOTP.generateSecret();
  const key = TOTP.base32Decode(secret);
  const totp = new TOTP(key);

  it('默认生成 6 位数字验证码', () => {
    expect(totp.generate()).toMatch(/^\d{6}$/);
  });

  it('verify 验证当前验证码', () => {
    expect(totp.verify(totp.generate())).toBe(true);
  });

  it('verify 接受数字类型验证码', () => {
    expect(totp.verify(Number(totp.generate()))).toBe(true);
  });

  it('verify 支持 ±1 时间窗口容错', () => {
    const now = Date.now();
    const prevCode = new TOTP(key).generate(now - 30_000);
    const nextCode = new TOTP(key).generate(now + 30_000);
    expect(totp.verify(prevCode, { timestamp: now })).toBe(true);
    expect(totp.verify(nextCode, { timestamp: now })).toBe(true);
  });

  it('window=0 时只匹配当前时间步', () => {
    const now = Date.now();
    const prevCode = new TOTP(key).generate(now - 30_000);
    expect(totp.verify(prevCode, { timestamp: now, window: 0 })).toBe(false);
  });

  it('错误验证码返回 false', () => {
    const code = totp.generate();
    const wrong = String((Number(code) + 1) % 1_000_000).padStart(6, '0');
    expect(totp.verify(wrong, { window: 0 })).toBe(false);
  });

  it('getRemainingSeconds 返回 1..timeStep 之间的整数', () => {
    const r = totp.getRemainingSeconds();
    expect(r).toBeGreaterThanOrEqual(1);
    expect(r).toBeLessThanOrEqual(30);
    expect(Number.isInteger(r)).toBe(true);
  });

  it('getRemainingSeconds 已知时间点', () => {
    expect(new TOTP(key).getRemainingSeconds(0)).toBe(30);
    expect(new TOTP(key).getRemainingSeconds(29_000)).toBe(1);
  });

  it('支持自定义 timeStep 与位数', () => {
    const custom = new TOTP(key, { timeStep: 60, digits: 8 });
    expect(custom.generate()).toMatch(/^\d{8}$/);
    expect(custom.getRemainingSeconds(0)).toBe(60);
  });

  it('generateSecret 默认 20 字节，Base32 编码后 32 字符且无填充', () => {
    const s = TOTP.generateSecret();
    expect(s).toMatch(/^[A-Z2-7]+={0,6}$/);
    expect(s.length).toBe(32);
    expect(s).not.toContain('=');
  });

  it('generateSecret 支持自定义字节数', () => {
    // 10 字节 = 80 bit = 16 个 Base32 字符
    expect(TOTP.generateSecret(10).length).toBe(16);
  });

  it('generateSecret 随机性（两次调用结果不同）', () => {
    expect(TOTP.generateSecret()).not.toBe(TOTP.generateSecret());
  });

  it('base32Decode 是 Base32.decode 的别名', () => {
    expect(TOTP.base32Decode('MZXW6===')).toEqual(enc('foo'));
  });

  it('generateAuthURI 带 issuer', () => {
    const uri = TOTP.generateAuthURI('user@example.com', 'JBSWY3DPEHPK3PXP', 'MyApp');
    expect(uri.startsWith('otpauth://totp/')).toBe(true);
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(uri).toContain('issuer=MyApp');
    expect(decodeURIComponent(uri)).toContain('MyApp:user@example.com');
  });

  it('generateAuthURI 不带 issuer 时 label 为账户名', () => {
    const uri = TOTP.generateAuthURI('user@example.com', 'JBSWY3DPEHPK3PXP');
    expect(uri).toBe('otpauth://totp/user%40example.com?secret=JBSWY3DPEHPK3PXP');
  });
});
