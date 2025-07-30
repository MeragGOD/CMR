// 📁 src/components/SideMenu.tsx
import React, {useState} from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // đúng đường dẫn
import SupportModal from './Support';

const { width } = Dimensions.get('window');

export default function SideMenu(
  {
  slideAnim,
  navigateAndClose,
}: {
  slideAnim: Animated.Value;
  navigateAndClose: (screen: string) => void;
}) {
  const [supportVisible, setSupportVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
      <View style={styles.sidebarContent}>
        <TouchableOpacity onPress={() => navigateAndClose('Dashboard')}>
          <Text style={styles.menuItem}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateAndClose('Calendar')}>
          <Text style={styles.menuItem}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateAndClose('Project')}>
          <Text style={styles.menuItem}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateAndClose('Vacations')}>
          <Text style={styles.menuItem}>Vacations</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateAndClose('EmployeeScreen')}>
          <Text style={styles.menuItem}>Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateAndClose('MessengerScreen')}>
          <Text style={styles.menuItem}>Messenger</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateAndClose('InfoPortalScreen')}>
          <Text style={styles.menuItem}>Info Portal</Text>
        </TouchableOpacity>
         <TouchableOpacity style={styles.supportButton} onPress={() => setSupportVisible(true)}>
          <Text style={styles.supportText}>💬 Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.removeItem('currentUser');
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          }}
        >
          <Text style={styles.logout}>→ Logout</Text>
        </TouchableOpacity>

      </View>
      <SupportModal visible={supportVisible} onClose={() => setSupportVisible(false)} />
    </Animated.View>
  );
}
