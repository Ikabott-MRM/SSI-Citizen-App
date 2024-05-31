import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import FabWithMenu from '@/components/FabWithMenu';
import { Stack } from 'expo-router';

export default function Credentials() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Credentials' }} />
      <FabWithMenu />
      <ScrollView>
        <Text>VCS list here</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 50,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
});
