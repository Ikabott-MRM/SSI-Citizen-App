import React, { useState } from 'react';
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { Link } from 'expo-router';

const FabWithMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      <FAB
        style={{
          ...styles.fab,
          backgroundColor: theme.colors.primary,
        }}
        color="white"
        mode="flat"
        icon="plus"
        onPress={toggleMenu}
      />
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.option}>
            <Link href="/identitySubmission" onPress={toggleMenu}>
              Licencia de Conducir
            </Link>
          </TouchableOpacity>
        </View>
      )}
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
  menu: {
    backgroundColor: '#f2f2f2',
    position: 'absolute',
    top: -50,
    minWidth: 120,
    right: 0,
    color: '#333',
    fontWeight: 600,
    borderWidth: 1,
    borderColor: '#F9f9f9',
    zIndex: 999,
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 5,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
});

export default FabWithMenu;
