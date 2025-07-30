import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../../components/AppLayout';
import EmployeeList from './EmployeeList';
import EmployeeActivity from './EmployeeActivity';

const EmployeeScreen = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'activity'>('list');
  

  useEffect(() => {
    const fetchEmployees = async () => {
      const currentStr = await AsyncStorage.getItem('currentUser');
      const allUsersStr = await AsyncStorage.getItem('users');
      if (!currentStr || !allUsersStr) return;

      const currentUser = JSON.parse(currentStr);
      setCurrentUser(currentUser);

      const membersStr = await AsyncStorage.getItem(`members_${currentUser.email}`);
      const memberEmails = membersStr ? JSON.parse(membersStr) : [];

      const allUsers = JSON.parse(allUsersStr);

      const enriched = memberEmails.map((member: any) => {
        const profile = allUsers.find((u: any) => u.email === member.email);
        return {
          ...member,
          ...profile,
          level: member.level || 'Intern',
        };
      });

      setEmployees(enriched);
    };

    fetchEmployees();
  }, []);

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Employees ({employees.length})</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveTab('list')}>
            <Text style={[styles.tabText, activeTab === 'list' && styles.tabActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveTab('activity')}>
            <Text style={[styles.tabText, activeTab === 'activity' && styles.tabActive]}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'list' ? (
          <EmployeeList employees={employees} currentUser={currentUser} />
        ) : (
          <EmployeeActivity employees={employees} />
        )}
      </View>
    </AppLayout>
  );
};

export default EmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e6ef',
    borderRadius: 999,
    marginBottom: 16,
  },
  tabText: {
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: '600',
    color: '#999',
  },
  tabActive: {
    backgroundColor: '#1e88e5',
    color: '#fff',
    borderRadius: 999,
  },
});
