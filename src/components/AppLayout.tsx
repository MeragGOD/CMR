//src/components/AppLayout.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import SearchBar from '../components/SearchBar';
import SideMenu from '../components/SideMenu';
import FloatingAddModal from './FAB';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface AppLayoutProps {
  children: React.ReactNode;
  showFloatingButton?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showFloatingButton = true }) => {
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuOpen ? -width * 0.75 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setMenuOpen(!menuOpen));
  };

  const navigateAndClose = (screen: string) => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.75,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setMenuOpen(false);
      navigation.navigate(screen as never); 
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eef4ff' }}>
      {/* Sidebar */}
      <SideMenu slideAnim={slideAnim} navigateAndClose={navigateAndClose} />

      {menuOpen && (
        <TouchableOpacity style={styles.menuOverlay} onPress={toggleMenu} />
      )}

      {/* SearchBar */}
      <SearchBar onMenuPress={toggleMenu} />

      {/* Main Content */}
      {children}

      {/* Floating Add Modal */}
      {showFloatingButton && <FloatingAddModal />}
    </SafeAreaView>
  );
};

export default AppLayout;
