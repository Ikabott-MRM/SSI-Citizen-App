import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Identity',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'person' : 'person-outline'}
              color={theme.colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="credentials"
        options={{
          title: 'Credentials',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'id-card' : 'id-card-outline'}
              color={theme.colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'list' : 'list-outline'}
              color={theme.colors.primary}
            />
          ),
        }}
      />
    </Tabs>
  );
}
