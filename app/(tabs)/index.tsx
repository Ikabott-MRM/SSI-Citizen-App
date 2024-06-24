import { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useDidMutation } from '@/hooks/mutations/useDidMutation';
import * as SecureStore from 'expo-secure-store';
import { KEY_DID_SECURE_STORE } from '@/constants/secureStore';
import { List } from '@/components/List';

const storedDid =
  Platform.OS !== 'web' ? SecureStore.getItem(KEY_DID_SECURE_STORE) : '';

export default function HomeScreen() {
  const { createDid, isPending } = useDidMutation();
  const [did, setDid] = useState<string | null>(storedDid);

  const handleCreateDid = async () => {
    await createDid(undefined, {
      onSuccess: data => {
        SecureStore.setItem(KEY_DID_SECURE_STORE, data.uri);
        setDid(data.uri);
      },
    });
  };

  return (
    <View style={styles.container}>
      {did && (
        <List data={[{ id: '1', title: 'Identidad (DID)', content: did }]} />
      )}
      {!isPending && !did && (
        <Button
          style={styles.button}
          mode="contained"
          onPress={handleCreateDid}
        >
          Crear DID
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
  },
  button: {
    marginTop: 300,
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
