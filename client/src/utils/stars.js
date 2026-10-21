/**
 * Formats a numeric rating (0 to 5) into a 5-star string representation.
 * Supports full stars (★), half stars (⯪), and empty stars (☆).
 *
 * @param {number} rating
 * @returns {string} 5-character star representation
 */
export const renderStars = (rating) => {
  if (rating == null || isNaN(rating) || rating < 0) return '☆☆☆☆☆';
  const clamped = Math.min(5, Math.max(0, rating));
  const full = Math.floor(clamped);
  const half = clamped % 1 >= 0.5 ? 1 : 0;
  const empty = Math.max(0, 5 - full - half);
  return '★'.repeat(full) + (half ? '⯪' : '') + '☆'.repeat(empty);
};
