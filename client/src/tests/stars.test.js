import { describe, it, expect } from 'vitest';
import { renderStars } from '../utils/stars';

describe('renderStars (Bug 4 fix)', () => {
  it('should render 5 full stars for rating 5', () => {
    expect(renderStars(5)).toBe('★★★★★');
  });

  it('should render 0 full stars and 5 empty stars for rating 0', () => {
    expect(renderStars(0)).toBe('☆☆☆☆☆');
  });

  it('should render 3 full, 1 half, and 1 empty star for rating 3.5', () => {
    expect(renderStars(3.5)).toBe('★★★⯪☆');
  });

  it('should render 0 full, 1 half, and 4 empty stars for rating 0.5', () => {
    expect(renderStars(0.5)).toBe('⯪☆☆☆☆');
  });

  it('should render 4 full, 1 half, and 0 empty stars for rating 4.5', () => {
    expect(renderStars(4.5)).toBe('★★★★⯪');
  });

  it('should render 2 full, 0 half, and 3 empty stars for rating 2', () => {
    expect(renderStars(2)).toBe('★★☆☆☆');
  });

  it('should handle invalid/null inputs gracefully', () => {
    expect(renderStars(null)).toBe('☆☆☆☆☆');
    expect(renderStars(undefined)).toBe('☆☆☆☆☆');
    expect(renderStars(NaN)).toBe('☆☆☆☆☆');
  });

  it('should clamp ratings between 0 and 5', () => {
    expect(renderStars(6)).toBe('★★★★★');
    expect(renderStars(-1)).toBe('☆☆☆☆☆');
  });
});
