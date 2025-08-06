import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppLayout from '../../components/AppLayout';
import { useFocusEffect } from '@react-navigation/native';

interface Request {
  type: 'Vacation' | 'Sick Leave' | 'Work remotely';
  mode: 'Days' | 'Hours';
  dates: string[];
  hours?: { from: string; to: string };
}

interface UserCard {
  email: string;
  avatar?: string;
  name?: string;
  counts: {
    Vacation: number;
    'Sick Leave': number;
    'Work remotely': number;
  };
}

const VacationScreen = () => {
  const [users, setUsers] = useState<UserCard[]>([]);

  useFocusEffect(() => {
    const loadData = async () => {
      
      const [reqStr, userStr, currentStr, membersStr] = await Promise.all([
        
        AsyncStorage.getItem('requests'),
        AsyncStorage.getItem('users'),
        AsyncStorage.getItem('currentUser'),
        AsyncStorage.getItem('currentUser').then(async (c) => {
          if (!c) return null;
          const { email } = JSON.parse(c);
          return AsyncStorage.getItem(`members_${email}`);
        }),
      ]);

      if (!reqStr || !currentStr || !userStr || !membersStr) return;

      const requestData = JSON.parse(reqStr);
      const userProfiles = JSON.parse(userStr); // Array of users
      const members = JSON.parse(membersStr);   // [{ email, level }, ...]

      const assigneeEmails = members
        .filter((m: any) => m.role === 'assignee')
        .map((m: any) => m.email);

      const currentUser = JSON.parse(currentStr);
const currentEmail = currentUser.email;

const allEmails = [currentEmail, ...assigneeEmails.filter((e:string) => e !== currentEmail)];

const userList: UserCard[] = allEmails.map((email: string) => {
  const requests: Request[] = requestData[email] || [];

  const counts = {
    Vacation: 0,
    'Sick Leave': 0,
    'Work remotely': 0,
  };

  requests.forEach((r) => {
    const amount = r.mode === 'Days' ? r.dates.length : 1;
    if (r.type in counts) {
      counts[r.type] += amount;
    }
  });

  const profile = userProfiles.find((u: any) => u.email === email);

  return {
    email,
    name: profile?.fullName || '',
    avatar: profile?.avatar,
    counts,
  };
});

setUsers(userList);
};

    loadData();
  }, );

  const renderCard = (item: UserCard) => (
  <View key={item.email} style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
  source={item.avatar ? { uri: item.avatar } : require('../../assets/profile.png')}
  style={styles.avatar}
/>

      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.statRow}>
      <Text style={styles.statText}>Vacations{'\n'}{item.counts.Vacation}</Text>
      <Text style={styles.statText}>Sick Leave{'\n'}{item.counts['Sick Leave']}</Text>
      <Text style={styles.statText}>Work remotely{'\n'}{item.counts['Work remotely']}</Text>
    </View>
  </View>
);


  return (
    <AppLayout>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Vacations</Text>
          {users.map(renderCard)}
        </ScrollView>
      </SafeAreaView>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#f3f8ff',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VacationScreen;
