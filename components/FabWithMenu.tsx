import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FAB, useTheme, Portal, Modal, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { CustomTheme } from '@/@types/theme';
import { useTranslation } from 'react-i18next';
import { tenantBrand } from '@/constants/brand';

const FabWithMenu = () => {
  const { t } = useTranslation();
  const theme = useTheme<CustomTheme>();
  const router = useRouter();
  const [visible, setVisible] = React.useState(false);
  const toggleModal = () => {
    setVisible(!visible);
  };

  const handleNewCredential = (schemaId: string) => {
    setVisible(false);
    router.push({
      pathname: '/identitySubmission',
      params: { schemaId },
    });
  };

  return (
    <View style={styles.container}>
      <FAB
        style={{
          ...styles.fab,
          backgroundColor: theme.colors.primary,
        }}
        color={theme.colors.onPrimary}
        mode="flat"
        icon="plus"
        onPress={toggleModal}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.customColors.background.color4,
            width: 350,
            alignSelf: 'center',
            paddingVertical: 20,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: theme.customColors.typography.primary,
              textAlign: 'center',
              fontSize: 24,
            }}
          >
            {t('Request new credential')}
          </Text>
          {tenantBrand.credentials.map(cred => (
            <Button
              key={cred.id}
              labelStyle={{
                fontSize: 18,
              }}
              style={styles.button}
              mode="contained"
              onPress={() => handleNewCredential(cred.id)}
              textColor={theme.colors.onPrimary}
            >
              {t(cred.labelKey)}
            </Button>
          ))}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  fab: {
    borderRadius: 50,
  },
  button: {
    marginTop: 20,
    width: 300,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 25,
    fontFamily: 'Roboto',
  },
});

export default FabWithMenu;
