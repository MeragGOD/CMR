// components/EmployeeActivity.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // đặt ở đầu file
import { useFocusEffect } from '@react-navigation/native';

const defaultAvatar = require('../../assets/profile.png');

interface Task {
  assignee: string;
  status: string;
  estimate?: string;
}

interface Props {
  employees: any[];
}

const EmployeeActivity = ({ employees }: Props) => {
  const [taskStats, setTaskStats] = useState<Record<string, { backlog: number; inProgress: number; inReview: number }>>({});

  useFocusEffect(() => {
  const fetchStats = async () => {
    const stats: Record<string, { backlog: number; inProgress: number; inReview: number }> = {};
    const projectsStr = await AsyncStorage.getItem('projects');
    const projects = projectsStr ? JSON.parse(projectsStr) : [];

    projects.forEach((project: any) => {
      (project.tasks || []).forEach((task: Task) => {
        const email = task.assignee;
        if (!email) return;

        if (!stats[email]) {
          stats[email] = { backlog: 0, inProgress: 0, inReview: 0 };
        }

        const estimateVal = parseFloat(task.estimate || '0');
        if (task.status === 'To Do' && estimateVal < 1) stats[email].backlog++;
        else if (task.status === 'In Progress') stats[email].inProgress++;
        else if (task.status === 'In Review') stats[email].inReview++;
      });
    });

    setTaskStats(stats);
  };

  fetchStats();
});


  const renderItem = ({ item }: { item: any }) => {
    const stats = taskStats[item.email] || { backlog: 0, inProgress: 0, inReview: 0 };

    return (
      <View style={[styles.card, item.status === 'inactive' && styles.inactiveCard]}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={item.avatar ? { uri: item.avatar } : defaultAvatar} style={styles.avatar} />
          {item.status === 'inactive' && <Text style={styles.zIcon}>💤</Text>}
        </View>

        {/* Info */}
        <Text style={styles.name}>{item.fullName || 'Unnamed'}</Text>
        <Text style={styles.role}>{item.youAre || item.role}</Text>
        <Text style={styles.level}>{item.level || 'Intern'}</Text>

        {/* Task Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.backlog}</Text>
            <Text style={styles.statLabel}>Backlog</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.inReview}</Text>
            <Text style={styles.statLabel}>In Review</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={employees}
      keyExtractor={(item) => item.email}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
};

export default EmployeeActivity;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 2,
    marginHorizontal: 4,
  },
  inactiveCard: {
    backgroundColor: '#fff7e6',
  },
  avatarContainer: {
    position: 'relative',
  },
  zIcon: {
    position: 'absolute',
    top: -4,
    right: -10,
    fontSize: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
  },
  role: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  level: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e88e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});

