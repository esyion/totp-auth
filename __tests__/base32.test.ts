import { Base32 } from '../src';

const enc = (s: string) => new TextEncoder().encode(s);

describe('Base32（RFC 4648 测试向量）', () => {
  const cases: Array<[Uint8Array, string]> = [
    [enc(''), ''],
    [enc('f'), 'MY======'],
    [enc('fo'), 'MZXQ===='],
    [enc('foo'), 'MZXW6==='],
    [enc('foob'), 'MZXW6YQ='],
    [enc('fooba'), 'MZXW6YTB'],
    [enc('foobar'), 'MZXW6YTBOI======'],
  ];

  it.each(cases)('encode(%p) → %p', (input, expected) => {
    expect(Base32.encode(input)).toBe(expected);
  });

  it.each(cases)('decode(encode(%p)) 往返一致', (input) => {
    expect(Base32.decode(Base32.encode(input))).toEqual(input);
  });

  it('解码时忽略填充且大小写不敏感', () => {
    expect(Base32.decode('mzxw6ytb')).toEqual(enc('fooba'));
  });

  it('非法字符抛出错误', () => {
    expect(() => Base32.decode('ABC1')).toThrow('Invalid Base32 character');
  });

  it('随机字节往返一致', () => {
    const data = new Uint8Array(64);
    crypto.getRandomValues(data);
    expect(Base32.decode(Base32.encode(data))).toEqual(data);
  });
});
