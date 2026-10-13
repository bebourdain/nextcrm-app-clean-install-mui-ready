/** Leave room between cards so a drag normally updates only the moved row. */
export const BOARD_ORDER_GAP = 1024;

export function rankBetween(before: number | null, after: number | null): number | null {
  const min = -2_147_483_648;
  const max = 2_147_483_647;
  if (before !== null && after !== null) {
    if (after - before <= 1) return null;
    return Math.floor((before + after) / 2);
  }
  if (before !== null) return before <= max - BOARD_ORDER_GAP ? before + BOARD_ORDER_GAP : null;
  if (after !== null) return after >= min + BOARD_ORDER_GAP ? after - BOARD_ORDER_GAP : null;
  return BOARD_ORDER_GAP;
}
