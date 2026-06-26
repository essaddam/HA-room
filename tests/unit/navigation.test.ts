import { describe, it, expect } from 'vitest';
import { HaRoomCard } from '../../src/ha-room-card.js';

describe('Navigation Path Validation', () => {
  it('should accept valid hash paths', () => {
    expect(HaRoomCard.isValidNavigationPath('#lights')).toBe(true);
    expect(HaRoomCard.isValidNavigationPath('#my-view-123')).toBe(true);
    expect(HaRoomCard.isValidNavigationPath('#test_view')).toBe(true);
  });

  it('should accept absolute paths', () => {
    expect(HaRoomCard.isValidNavigationPath('/lovelace/lights')).toBe(true);
    expect(HaRoomCard.isValidNavigationPath('/config/dashboard')).toBe(true);
  });

  it('should accept external URLs', () => {
    expect(HaRoomCard.isValidNavigationPath('https://example.com')).toBe(true);
    expect(HaRoomCard.isValidNavigationPath('http://localhost:8123')).toBe(true);
  });

  it('should reject invalid paths', () => {
    expect(HaRoomCard.isValidNavigationPath('javascript:alert(1)')).toBe(false);
    expect(HaRoomCard.isValidNavigationPath('data:text/html,<script>')).toBe(false);
    expect(HaRoomCard.isValidNavigationPath('')).toBe(false);
    expect(HaRoomCard.isValidNavigationPath('   ')).toBe(false);
  });
});
