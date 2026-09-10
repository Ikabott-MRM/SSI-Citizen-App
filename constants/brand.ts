import { ImageSourcePropType } from 'react-native';

export type TenantSlug = 'geyser' | 'avaldao' | 'default';

type TenantBrand = {
  slug: TenantSlug;
  displayName: string;
  primary: string;
  primaryDark: string;
  accent: string;
  headerBackground: string;
  adaptiveIconBackground: string;
  logo: ImageSourcePropType;
  androidPackageCitizen: string;
  iosBundleCitizen: string;
};

const brands: Record<TenantSlug, TenantBrand> = {
  geyser: {
    slug: 'geyser',
    displayName: 'Geyser',
    primary: '#00F5DC',
    primaryDark: '#21201C',
    accent: '#00C3AD',
    headerBackground: '#21201C',
    adaptiveIconBackground: '#00F5DC',
    logo: require('../assets/images/tenants/geyser-logo.png'),
    androidPackageCitizen: 'com.ikabott.ssi.citizen.geyser',
    iosBundleCitizen: 'com.ikabott.ssi.citizen.geyser',
  },
  avaldao: {
    slug: 'avaldao',
    displayName: 'AvalDAO',
    primary: '#292A6D',
    primaryDark: '#1A1B4A',
    accent: '#7868E5',
    headerBackground: '#292A6D',
    adaptiveIconBackground: '#292A6D',
    logo: require('../assets/images/tenants/avaldao-logo.png'),
    androidPackageCitizen: 'com.ikabott.ssi.citizen.avaldao',
    iosBundleCitizen: 'com.ikabott.ssi.citizen.avaldao',
  },
  default: {
    slug: 'default',
    displayName: 'SSI Ciudadano',
    primary: '#0B3D6E',
    primaryDark: '#062847',
    accent: '#4A90A4',
    headerBackground: '#343434',
    adaptiveIconBackground: '#0B3D6E',
    logo: require('../assets/images/tenants/geyser-logo.png'),
    androidPackageCitizen: 'com.ikabott.ssi.citizen',
    iosBundleCitizen: 'com.ikabott.ssi.citizen',
  },
};

function resolveSlug(): TenantSlug {
  const raw = (process.env.EXPO_PUBLIC_TENANT_SLUG || '').trim().toLowerCase();
  if (raw === 'geyser' || raw === 'avaldao') return raw;
  return 'geyser';
}

export const tenantBrand: TenantBrand = brands[resolveSlug()];
