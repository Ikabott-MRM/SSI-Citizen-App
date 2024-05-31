import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { FAB } from 'react-native-paper';
import { Link } from 'expo-router';

const FabWithMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      <FAB style={styles.fab} mode="flat" icon="plus" onPress={toggleMenu} />
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.option}>
            <Link href="/identitySubmission" onPress={toggleMenu}>
              Driver License
            </Link>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    top: 0,
    right: 0,
    borderRadius: 0,
  },
  menu: {
    position: 'absolute',
    top: 80,
    minWidth: 180,
    right: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default FabWithMenu;
