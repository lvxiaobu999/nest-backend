import * as bcrypt from 'bcrypt';

// bcrypt 的工作因子，数值越大越安全，但哈希耗时也会更高。
const PASSWORD_SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

// 登录时使用 compare 对明文和哈希结果做安全比对，避免自行处理盐值。
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
