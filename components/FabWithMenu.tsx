import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
              Licencia de conducir
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
  },
  fab: {
    borderRadius: 0,
  },
  menu: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 60,
    minWidth: 180,
    right: 0,
    color: '#000',
    borderWidth: 1,
    borderColor: '#CCC',
    zIndex: 999,
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default FabWithMenu;
