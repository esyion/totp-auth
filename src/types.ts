export interface TOTPOptions {
  /** 时间步进（秒），默认 30 */
  timeStep?: number;
  /** 验证码位数，默认 6 */
  digits?: number;
  /** 哈希算法，默认 'SHA-1' */
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
}

export interface HOTPOptions {
  /** 验证码位数，默认 6 */
  digits?: number;
  /** 哈希算法，默认 'SHA-1' */
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
}

export interface ValidateOptions {
  /** 验证时间，默认当前时间 */
  timestamp?: Date | number;
  /** 容错窗口（前后几个时间步进），默认 1 */
  window?: number;
}
