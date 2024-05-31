import { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Text, Button } from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDid';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

export default function Identity() {
  const { createDid, isPending } = useDidMutation();
  const [did, setDid] = useState<string | null>(storedDid);

  const handleCreateDid = () => {
    createDid(undefined, {
      onSuccess: data => {
        if (Platform.OS !== 'web') {
          SecureStore.setItem(KEY_DID_SECURE_STORE, data.uri);
        }
        setDid(data.uri);
      },
    });
  };

  return (
    <View style={styles.container}>
      {did && (
        <View>
          <Text variant="titleLarge">My DID:</Text>
          <Text variant="bodyMedium">{did}</Text>
        </View>
      )}
      {!isPending && !did && (
        <Button
          style={styles.button}
          mode="contained"
          onPress={handleCreateDid}
        >
          Create DID
        </Button>
      )}
      {isPending && <ActivityIndicator size="large" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 50,
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
    maxWidth: 200,
    alignSelf: 'center',
  },
});
