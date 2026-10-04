// Scale khoảng cách — số chẵn, dễ nhân/2 khi dựng layout. Tuân thủ 4pt grid.
export const spacing: Record<string, number> = {
  px0: 0,
  px2: 2,
  px4: 4,
  px6: 6,
  px8: 8,
  px10: 10,
  px12: 12,
  px14: 14,
  px16: 16,
  px18: 18,
  px20: 20,
  px24: 24,
  px28: 28,
  px32: 32,
  px40: 40,
  px48: 48,
  px56: 56,
  px64: 64,
  px80: 80,
} as const;

export const sectionGap: Record<string, number> = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export const contentInset: Record<string, number> = {
  horizontal: 16,
  top: 12,
  bottom: 32,
  bottomWithStickyFooter: 112,
  safeTopExtra: 8,
} as const;

// Touch target tối thiểu 44pt cho vùng bấm; dùng cho icon-only buttons
export const hitSlop: Record<string, { top: number; bottom: number; left: number; right: number }> = {
  sm: { top: 6, bottom: 6, left: 6, right: 6 },
  md: { top: 10, bottom: 10, left: 10, right: 10 },
  lg: { top: 14, bottom: 14, left: 14, right: 14 },
} as const;

export type Spacing = typeof spacing;
export default spacing;
