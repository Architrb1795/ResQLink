// No import from 'vitest' — using globals:true in vitest.config.ts
// describe, it, expect, vi are injected globally by vitest

describe('Sanity', () => {
  it('adds 1 + 1', () => {
    expect(1 + 1).toBe(2);
  });
});
