import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Text, useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#343434',
          borderColor: '#343434',
        },
        tabBarLabel: ({ focused }) => {
          let label;
          switch (route.name) {
            case 'index':
              label = 'Identidad';
              break;
            case 'credentials':
              label = 'Credenciales';
              break;
            case 'requests':
              label = 'Solicitudes';
              break;
            default:
              label = '';
          }
          return (
            <Text style={{ color: focused ? theme.colors.primary : '#e0e0e0' }}>
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
              color={focused ? theme.colors.primary : '#e0e0e0'}
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
              color={focused ? theme.colors.primary : '#e0e0e0'}
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
              color={focused ? theme.colors.primary : '#e0e0e0'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
