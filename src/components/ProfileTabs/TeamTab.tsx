// src/components/ProfileTabs/TeamTab.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultAvatar = require('../../assets/profile.png');

const TeamTab = () => {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
  const loadTeam = async () => {
    const userStr = await AsyncStorage.getItem('currentUser');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    if (!currentUser) return;

    const allUsersStr = await AsyncStorage.getItem('users');
    const allUsers = allUsersStr ? JSON.parse(allUsersStr) : [];

    const memberData = await AsyncStorage.getItem(`members_${currentUser.email}`);
    const emails = memberData ? JSON.parse(memberData) : [];

    const enrichedMembers = emails.map((m: any) => {
      const profile = allUsers.find((u: any) => u.email === m.email) || {};
      return {
        ...m,
        ...profile,
        name: m.name || profile.name || m.email.split('@')[0],
        avatar: m.avatar || profile.avatar || '',
        role: m.position || profile.position || 'Employee',
        level: m.level || profile.level || 'Junior',
      };
    });
    const currentUserProfile = allUsers.find((u: any) => u.email === currentUser.email) || {};
    const currentUserCard = {
      email: currentUser.email,
      name:
        typeof currentUser.fullName === 'string'
          ? currentUser.fullName
          : currentUser.fullName?.name || currentUser.email.split('@')[0],
      avatar: currentUser.avatar || currentUserProfile.avatar || '',
      role: currentUser.position || currentUserProfile.position || 'Team Leader',
      level: currentUser.level || currentUserProfile.level || 'Senior',
    };

    setMembers([currentUserCard, ...enrichedMembers]);
  };

  loadTeam();
}, []);

  if (members.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>No team members found.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {members.map((member, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.row}>
            <Image
              source={member.avatar ? { uri: member.avatar } : defaultAvatar}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.role}>{member.role}</Text>
              <Text style={styles.level}>{member.level}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default TeamTab;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
    color: '#555',
  },
  level: {
    fontSize: 12,
    color: '#999',
  },
});
