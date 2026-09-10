/**
 * App tint / tab colors derived from the active tenant brand.
 * Avoid hard-coded navy defaults that fight Geyser teal contrast.
 */
import { tenantBrand } from './brand';

const tintColorLight = tenantBrand.primaryDark;
const tintColorDark = tenantBrand.primary;
const warning = '#C5A028';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    warning,
  },
  dark: {
    text: '#ECEDEE',
    background: tenantBrand.primaryDark,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    warning,
  },
};
