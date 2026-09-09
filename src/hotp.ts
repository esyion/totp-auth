import { createHmac } from 'crypto';
import type { HOTPOptions } from './types';

/**
 * RFC 4226 HMAC-based One-Time Password。
 */
export class HOTP {
  protected key: Uint8Array;
  protected digits: number;
  protected algorithm: string;

  constructor(key: Uint8Array, options: HOTPOptions = {}) {
    this.key = key;
    this.digits = options.digits || 6;
    this.algorithm = (options.algorithm || 'SHA-1').replace('-', '');
  }

  generate(counter: number): string {
    // 计数器按 64 位大端写入：高 32 位 + 低 32 位
    const buffer = Buffer.alloc(8);
    const high = Math.floor(counter / 0x100000000);
    const low = counter >>> 0;
    buffer.writeUInt32BE(high, 0);
    buffer.writeUInt32BE(low, 4);

    const hmac = createHmac(this.algorithm, this.key);
    hmac.update(buffer);
    const hash = hmac.digest();

    // 动态截断（dynamic truncation）
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, this.digits);
    return String(otp).padStart(this.digits, '0');
  }

  validate(
    code: string | number,
    counter: number,
    window = 0
  ): { valid: boolean; counter?: number } {
    const codeStr = String(code).padStart(this.digits, '0');
    for (let i = 0; i <= window; i++) {
      if (this.generate(counter + i) === codeStr) {
        return { valid: true, counter: counter + i };
      }
    }
    return { valid: false };
  }
}
