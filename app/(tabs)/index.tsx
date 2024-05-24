import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDid';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';

const storedDid = SecureStore.getItem(KEY_DID_SECURE_STORE);

export default function HomeScreen() {
  const { createDid, isPending } = useDidMutation();
  const [did, setDid] = useState<string | null>(storedDid);

  const handleCreateDid = () => {
    createDid(undefined, {
      onSuccess: data => {
        SecureStore.setItem(KEY_DID_SECURE_STORE, data.uri);
        setDid(data.uri);
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium">My DID: {did}</Text>
      {!isPending && (
        <Button mode="contained" onPress={handleCreateDid}>
          Create DID
        </Button>
      )}
      {isPending && <ActivityIndicator size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
