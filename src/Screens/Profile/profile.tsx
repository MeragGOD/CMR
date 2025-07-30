//src/Screens/Profile/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppLayout from '../../components/AppLayout';
import ProjectsTab from '../../components/ProfileTabs/ProjectsTab';
import TeamTab from '../../components/ProfileTabs/TeamTab';
import VacationsTab from '../../components/ProfileTabs/VacationsTab';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';


const defaultAvatar = require('../../assets/profile.png');

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [birthday, setBirthday] = useState('');
const [location, setLocation] = useState('');
const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'vacations'>('projects');


useFocusEffect(
  React.useCallback(() => {
    const fetchUser = async () => {
      const data = await AsyncStorage.getItem('currentUser');
    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      setBirthday(parsed.birthday || '');
      setLocation(parsed.location || '');
    }};
    
    fetchUser();
  }, [])
);

  return (
    <AppLayout><ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
       <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Feather name="settings" size={22} color="#333" />
        </TouchableOpacity>


      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : defaultAvatar}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <Feather name="edit-2" size={16} color="#1e88e5" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user?.fullName || 'Your Name'}</Text>
        <Text style={styles.role}>{user?.youAre || ''}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Main Info</Text>

          <Text style={styles.label}>Position</Text>
          <Text style={styles.input}>{user?.youAre || ''}</Text>

          <Text style={styles.label}>Company</Text>
          <Text style={styles.input}>{user?.companyName || ''}</Text>

          <Text style={styles.label}>Location</Text>
          <View style={styles.inputIconRow}>
            <Text style={[styles.input, { flex: 1 }]}>{location || 'Your city, country...'}</Text>
            <Text style={styles.icon}>📍</Text>
          </View>

          <Text style={styles.label}>Birthday Date</Text>
          <View style={styles.inputIconRow}>
            <Text style={[styles.input, { flex: 1 }]}>{birthday || 'MM/DD/YYYY'}</Text>
            <Text style={styles.icon}>📅</Text>
          </View>


        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Info</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.input}>{user?.email || ''}</Text>

          <Text style={styles.label}>Mobile Number</Text>
          <Text style={styles.input}>{user?.phone || ''}</Text>
        </View>
        {/* Project Header */}
        <View style={styles.projectHeader}>
          <Text style={styles.dropdown}>Current Projects ▼</Text>
          <Feather name="filter" size={20} color="#666" />
        </View>

        {/* Tabs */}<View style={styles.tabs}>
  <TouchableOpacity
    style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
    onPress={() => setActiveTab('projects')}>
    <Text style={activeTab === 'projects' ? styles.tabTextActive : styles.tabText}>Projects</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.tab, activeTab === 'team' && styles.tabActive]}
    onPress={() => setActiveTab('team')}>
    <Text style={activeTab === 'team' ? styles.tabTextActive : styles.tabText}>Team</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.tab, activeTab === 'vacations' && styles.tabActive]}
    onPress={() => setActiveTab('vacations')}>
    <Text style={activeTab === 'vacations' ? styles.tabTextActive : styles.tabText}>Vacations</Text>
  </TouchableOpacity>
  </View>
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'vacations' && <VacationsTab />}
      </View>
    </ScrollView></AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eef4ff',
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  editBtn: {
    backgroundColor: '#eef4ff',
    padding: 8,
    borderRadius: 8,
  },
  inputIconRow: {
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
  },
  icon: {
    position: 'absolute',
    right: 12,
    fontSize: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  role: {
    color: '#777',
    marginBottom: 12,
  },
  infoSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  input: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafa',
    borderRadius: 8,
    color: '#333',
  },
  projectHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 16,
  marginBottom: 12,
},
dropdown: {
  fontSize: 14,
  fontWeight: '500',
  color: '#333',
},
tabs: {
  flexDirection: 'row',
  backgroundColor: '#dbeafe',
  borderRadius: 20,
  padding: 4,
  marginBottom: 16,
},
tab: {
  flex: 1,
  paddingVertical: 8,
  alignItems: 'center',
  borderRadius: 20,
},
tabActive: {
  backgroundColor: '#1e88e5',
},
tabText: {
  color: '#333',
  fontWeight: '500',
},
tabTextActive: {
  color: '#fff',
  fontWeight: '600',
},
projectCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 24,
  marginBottom: 16,
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: '#e0e0e0',
  borderWidth: 1,
},
emptyText: {
  fontSize: 14,
  color: '#aaa',
},

});
