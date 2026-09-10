import { ImageSourcePropType } from 'react-native';

export type TenantSlug = 'geyser' | 'avaldao' | 'default';

export type TenantCredentialOption = {
  id: string;
  labelKey: string;
};

type TenantBrand = {
  slug: TenantSlug;
  displayName: string;
  primary: string;
  primaryDark: string;
  accent: string;
  /** Text / icon color on primary buttons (readable contrast). */
  onPrimary: string;
  headerBackground: string;
  adaptiveIconBackground: string;
  logo: ImageSourcePropType;
  androidPackageCitizen: string;
  iosBundleCitizen: string;
  /** Credential types offered in the citizen UX for this tenant. */
  credentials: TenantCredentialOption[];
};

const brands: Record<TenantSlug, TenantBrand> = {
  geyser: {
    slug: 'geyser',
    displayName: 'Geyser',
    primary: '#00F5DC',
    primaryDark: '#21201C',
    accent: '#00C3AD',
    onPrimary: '#21201C',
    headerBackground: '#21201C',
    adaptiveIconBackground: '#00F5DC',
    logo: require('../assets/images/tenants/geyser-logo.png'),
    androidPackageCitizen: 'com.ikabott.ssi.citizen.geyser',
    iosBundleCitizen: 'com.ikabott.ssi.citizen.geyser',
    credentials: [
      { id: 'donor', labelKey: 'Donor' },
      { id: 'fundraiser', labelKey: 'Fundraiser' },
    ],
  },
  avaldao: {
    slug: 'avaldao',
    displayName: 'AvalDAO',
    primary: '#292A6D',
    primaryDark: '#1A1B4A',
    accent: '#7868E5',
    onPrimary: '#FFFFFF',
    headerBackground: '#292A6D',
    adaptiveIconBackground: '#292A6D',
    logo: require('../assets/images/tenants/avaldao-logo.png'),
    androidPackageCitizen: 'com.ikabott.ssi.citizen.avaldao',
    iosBundleCitizen: 'com.ikabott.ssi.citizen.avaldao',
    credentials: [{ id: 'associate', labelKey: 'Associate' }],
  },
  default: {
    slug: 'default',
    displayName: 'SSI Ciudadano',
    primary: '#0B3D6E',
    primaryDark: '#062847',
    accent: '#4A90A4',
    onPrimary: '#FFFFFF',
    headerBackground: '#343434',
    adaptiveIconBackground: '#0B3D6E',
    logo: require('../assets/images/tenants/geyser-logo.png'),
    androidPackageCitizen: 'com.ikabott.ssi.citizen',
    iosBundleCitizen: 'com.ikabott.ssi.citizen',
    credentials: [{ id: 'associate', labelKey: 'Associate' }],
  },
};

function resolveSlug(): TenantSlug {
  const raw = (process.env.EXPO_PUBLIC_TENANT_SLUG || '').trim().toLowerCase();
  if (raw === 'geyser' || raw === 'avaldao') return raw;
  return 'geyser';
}

export const tenantBrand: TenantBrand = brands[resolveSlug()];
