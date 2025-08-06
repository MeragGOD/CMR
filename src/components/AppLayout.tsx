// src/components/AppLayout.tsx
import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import styles from './styles';
import SearchBar from './SearchBar';
import FloatingAddModal from './FAB';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppLayoutProps {
  children: React.ReactNode;
  showFloatingButton?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showFloatingButton = true }) => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eef4ff' }}>
      {/* SearchBar with drawer toggle */}
      <SearchBar onMenuPress={openDrawer} />

      {/* Main Content */}
      {children}

      {/* Floating Add Modal */}
      {showFloatingButton && <FloatingAddModal />}
    </SafeAreaView>
  );
};

export default AppLayout;
