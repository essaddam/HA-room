import { describe, it, expect } from 'vitest';

// Import the validation function logic
function isValidNavigationPath(path: string): boolean {
  return /^#[a-zA-Z0-9_-]+$/.test(path) ||
         /^\//.test(path) ||
         /^https?:\/\//.test(path);
}

describe('Navigation Path Validation', () => {
  it('should accept valid hash paths', () => {
    expect(isValidNavigationPath('#lights')).toBe(true);
    expect(isValidNavigationPath('#my-view-123')).toBe(true);
    expect(isValidNavigationPath('#test_view')).toBe(true);
  });

  it('should accept absolute paths', () => {
    expect(isValidNavigationPath('/lovelace/lights')).toBe(true);
    expect(isValidNavigationPath('/config/dashboard')).toBe(true);
  });

  it('should accept external URLs', () => {
    expect(isValidNavigationPath('https://example.com')).toBe(true);
    expect(isValidNavigationPath('http://localhost:8123')).toBe(true);
  });

  it('should reject invalid paths', () => {
    expect(isValidNavigationPath('javascript:alert(1)')).toBe(false);
    expect(isValidNavigationPath('data:text/html,<script>')).toBe(false);
    expect(isValidNavigationPath('')).toBe(false);
    expect(isValidNavigationPath('   ')).toBe(false);
  });
});
