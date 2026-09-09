import { HOTP } from '../src';

const KEY = new TextEncoder().encode('12345678901234567890');

describe('HOTP（RFC 4226 附录 D 测试向量）', () => {
  const hotp = new HOTP(KEY);
  const vectors: Array<[number, string]> = [
    [0, '755224'],
    [1, '287082'],
    [2, '359152'],
    [3, '969429'],
    [4, '338314'],
    [5, '254676'],
    [6, '287922'],
    [7, '162583'],
    [8, '399871'],
    [9, '520489'],
  ];

  it.each(vectors)('counter=%i → %s', (counter, code) => {
    expect(hotp.generate(counter)).toBe(code);
  });

  it('validate 命中当前 counter', () => {
    expect(hotp.validate('359152', 2)).toEqual({ valid: true, counter: 2 });
  });

  it('validate 支持数字类型验证码', () => {
    expect(hotp.validate(755224, 0)).toEqual({ valid: true, counter: 0 });
  });

  it('validate 向前容忍窗口', () => {
    expect(hotp.validate('969429', 2, 2)).toEqual({ valid: true, counter: 3 });
  });

  it('validate 未命中返回 valid: false', () => {
    expect(hotp.validate('000000', 0, 2)).toEqual({ valid: false });
  });

  it('支持 SHA-256 / SHA-512 算法', () => {
    const sha256 = new HOTP(KEY, { digits: 8, algorithm: 'SHA-256' });
    const sha512 = new HOTP(KEY, { digits: 8, algorithm: 'SHA-512' });
    expect(sha256.generate(0)).toMatch(/^\d{8}$/);
    expect(sha512.generate(0)).toMatch(/^\d{8}$/);
    // 同一密钥同一计数器下，不同算法应产生不同验证码
    expect(sha256.generate(0)).not.toBe(sha512.generate(0));
  });
});
