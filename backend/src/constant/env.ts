import 'dotenv/config';

class Env {
  static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  static readonly SERVER_PORT = process.env.SERVER_PORT || '3000';
  static readonly SERVER_IP = process.env.SERVER_IP || '127.0.0.1';
  static readonly JWT_SECRET = process.env.JWT_SECRET || 'default_insecure_secret';
  static readonly JWT_ISSUER = process.env.JWT_ISSUER || 'personal-assistant';
  static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  static readonly PREFIX_TERM = process.env.PREFIX_TERM || '';
  static readonly CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
  static readonly DB_NAME = process.env.DB_NAME || 'database.sqlite';

  static validateEnv(): string | null {
    if (!process.env.JWT_SECRET) {
      return 'WARNING: JWT_SECRET is not set. Using default secret — insecure for production.';
    }

    if (!process.env.DB_NAME) {
      return 'WARNING: DB_NAME is not set. Using default name "database.sqlite".';
    }
    return null;
  }
}

export default Env;
