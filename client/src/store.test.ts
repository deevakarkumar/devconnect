import { describe, it, expect, beforeEach } from 'vitest';
import { useUI } from './store';

describe('useUI Zustand store', () => {
  beforeEach(() => {
    useUI.setState({ menuOpen: false, toasts: [] });
  });

  it('initializes with default state', () => {
    const state = useUI.getState();
    expect(state.menuOpen).toBe(false);
    expect(state.toasts).toEqual([]);
  });

  it('toggles menu state correctly', () => {
    expect(useUI.getState().menuOpen).toBe(false);
    useUI.getState().toggleMenu();
    expect(useUI.getState().menuOpen).toBe(true);
    useUI.getState().toggleMenu();
    expect(useUI.getState().menuOpen).toBe(false);
  });

  it('pushes toasts and keeps max 5 newest', () => {
    for (let i = 1; i <= 7; i++) {
      useUI.getState().pushToast({
        id: `t-${i}`,
        type: 'NOTIFICATION',
        message: `Message ${i}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    const toasts = useUI.getState().toasts;
    expect(toasts.length).toBe(5);
    expect(toasts[0].message).toBe('Message 7');
    expect(toasts[4].message).toBe('Message 3');
  });

  it('clears toasts properly', () => {
    useUI.getState().pushToast({
      id: 't-1',
      type: 'NOTIFICATION',
      message: 'Hello',
      read: false,
      createdAt: new Date().toISOString(),
    });
    expect(useUI.getState().toasts.length).toBe(1);
    useUI.getState().clearToasts();
    expect(useUI.getState().toasts.length).toBe(0);
  });
});
