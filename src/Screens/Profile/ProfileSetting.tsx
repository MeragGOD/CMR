import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../../components/AppLayout';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState<string | null>('Notifications');

  const toggleExpand = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const [settings, setSettings] = useState({
    issueActivity: true,
    trackingActivity: false,
    newComments: false,
    noNotiAfter9pm: false,
  });

  useFocusEffect(() => {
    loadSettings();
  },);

  const loadSettings = async () => {
    try {
      const settingsStr = await AsyncStorage.getItem('notificationSettings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings', error);
    }
  };

  const saveSettings = async (updated: Partial<typeof settings>) => {
    try {
      const newSettings = { ...settings, ...updated };
      setSettings(newSettings);
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (err) {
      Alert.alert('Failed to save settings');
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key];
    saveSettings({ [key]: newValue });
  };

  return (
    <AppLayout>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color="#1A73E8" />
          <Text style={styles.backText}>Back to Profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        {/* Account Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleExpand('Account')}>
            <Feather name="user" size={18} color="#1e293b" />
            <Text style={styles.sectionText}>Account</Text>
            <Feather
              name={expandedSection === 'Account' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#64748b"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {expandedSection === 'Account' && (
            <View style={styles.subContent}>
              <Text style={styles.subText}>User profile, email, and password settings.</Text>
            </View>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleExpand('Notifications')}>
            <Feather name="bell" size={18} color="#1e293b" />
            <Text style={styles.sectionText}>Notifications</Text>
            <Feather
              name={expandedSection === 'Notifications' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#64748b"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {expandedSection === 'Notifications' && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Issue Activity</Text>
                <Text style={styles.cardDesc}>Send me email notifications for issue activity</Text>
                <Switch
                  value={settings.issueActivity}
                  onValueChange={() => toggleSetting('issueActivity')}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Tracking Activity</Text>
                <Text style={styles.cardDesc}>Send me notifications when someone’s tracked time in tasks</Text>
                <Switch
                  value={settings.trackingActivity}
                  onValueChange={() => toggleSetting('trackingActivity')}
                />
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>New Comments</Text>
                <Text style={styles.cardDesc}>Send me notifications when someone’s sent the comment</Text>
                <Switch
                  value={settings.newComments}
                  onValueChange={() => toggleSetting('newComments')}
                />
              </View>

              <View style={styles.row}>
                <MaterialCommunityIcons name="clock-check-outline" size={18} color="#1e293b" />
                <Text style={styles.rowText}>Don’t send me notifications after 9:00 PM</Text>
                <Switch
                  value={settings.noNotiAfter9pm}
                  onValueChange={() => toggleSetting('noNotiAfter9pm')}
                />
              </View>
            </View>
          )}
        </View>

        {/* Other Sections */}
        {[
          { title: 'My Company', icon: 'office-building' },
          { title: 'Connected Apps', icon: 'account-multiple' },
          { title: 'Payments', icon: 'credit-card' },
          { title: 'Confidentiality', icon: 'shield-lock-outline' },
          { title: 'Safety', icon: 'shield-check-outline' },
        ].map(({ title, icon }) => (
          <View style={styles.section} key={title}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleExpand(title)}>
              <MaterialCommunityIcons name={icon as any} size={18} color="#1e293b" />
              <Text style={styles.sectionText}>{title}</Text>
              <Feather
                name={expandedSection === title ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#64748b"
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
            {expandedSection === title && (
              <View style={styles.subContent}>
                <Text style={styles.subText}>This is the setting content for {title}.</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1A73E8',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  subContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: -4,
  },
  subText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#f1f5ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
});
