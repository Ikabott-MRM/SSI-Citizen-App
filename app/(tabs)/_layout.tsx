import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { tenantBrand } from '@/constants/brand';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tenantBrand.headerBackground,
          borderTopColor: '#E4EAEA',
          borderColor: '#E4EAEA',
        },
        tabBarLabel: ({ focused }) => {
          let label;
          switch (route.name) {
            case 'index':
              label = t('Identity');
              break;
            case 'credentials':
              label = t('Credentials');
              break;
            case 'requests':
              label = t('Requests');
              break;
            case 'settings':
              label = t('Settings');
              break;
            default:
              label = '';
          }
          return (
            <Text style={{ color: focused ? theme.colors.primary : '#6B7280' }}>
              {label}
            </Text>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'person' : 'person-outline'}
              color={focused ? theme.colors.primary : '#6B7280'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="credentials"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'id-card' : 'id-card-outline'}
              color={focused ? theme.colors.primary : '#6B7280'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'list' : 'list-outline'}
              color={focused ? theme.colors.primary : '#6B7280'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'settings' : 'settings-outline'}
              color={focused ? theme.colors.primary : '#6B7280'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
