// src/components/SideMenu.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import styles from './styles';
import SupportModal from './Support';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { label: 'Dashboard', icon: <Feather name="grid" size={18} />, screen: 'Dashboard' },
  { label: 'Projects', icon: <Feather name="folder" size={18} />, screen: 'Project' },
  { label: 'Calendar', icon: <Feather name="calendar" size={18} />, screen: 'Calendar' },
  { label: 'Vacations', icon: <Feather name="sun" size={18} />, screen: 'Vacations' },
  { label: 'Employees', icon: <Feather name="users" size={18} />, screen: 'EmployeeScreen' },
  { label: 'Messenger', icon: <Feather name="message-square" size={18} />, screen: 'MessengerScreen' },
  { label: 'Info Portal', icon: <Feather name="info" size={18} />, screen: 'InfoPortalScreen' },
];


export default function SideMenu({ navigation, state }: DrawerContentComponentProps) {
  const [supportVisible, setSupportVisible] = useState(false);
  const activeRoute = state.routeNames[state.index];

  return (
    <View style={styles.sidebar}>
  <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 20 }}>
    <Image source={require('../assets/logo.png')} style={{ width: 36, height: 36 }} />
  </View>

  {/* Menu items */}
  <View style={styles.menu}>
    {menuItems.map((item, index) => {
      const isActive = activeRoute === item.screen;
      return (
        <TouchableOpacity
          key={index}
          style={[styles.menuItem, isActive && styles.menuItemActive]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.menuIcon}>{item.icon}</View>
          <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}

    {/* ➕ Support và Logout ngay dưới danh sách menu */}
    <TouchableOpacity style={styles.supportButton} onPress={() => setSupportVisible(true)}>
      <Text style={styles.supportText}>💬 Support</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.logoutButton}
      onPress={async () => {
        await AsyncStorage.removeItem('currentUser');
        navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
      }}
    >
      <Text style={styles.logoutText}>→ Logout</Text>
    </TouchableOpacity>
  </View>

  <SupportModal visible={supportVisible} onClose={() => setSupportVisible(false)} />
</View>

  );
}

