import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  it('should not log in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../../src/const.js');
    logger.log('test message');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('../../src/const.js');
    logger.log('test message');
    expect(console.log).toHaveBeenCalledWith('test message');
  });

  it('should always log errors regardless of mode', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../../src/const.js');
    logger.error('error message');
    expect(console.error).toHaveBeenCalledWith('error message');
  });
});
