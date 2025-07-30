import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import AppLayout from '../../components/AppLayout';

const defaultAvatar = require('../../assets/profile.png');

export default function InfoPortalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [growth, setGrowth] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      const projectsStr = await AsyncStorage.getItem('projects');
      if (!userStr || !projectsStr) return;

      const user = JSON.parse(userStr);
      const allProjects = JSON.parse(projectsStr);
      const userProjects = allProjects.filter((p: any) => p.createdBy === user.email);

      setCurrentUser(user);
      setProjects(userProjects);

      const currentCount = userProjects.length;
      const previousCount = await AsyncStorage.getItem('projectCountLastMonth');
      const lastMonth = previousCount ? parseInt(previousCount) : 0;
      setGrowth(currentCount - lastMonth);
    };

    fetchData();
  }, []);

    const handleOpenProject = (project: any) => {
      const firstTask = (project.tasks || [])[0];
      navigation.navigate('TaskOverviewScreen', {
        project,
        taskId: firstTask?.id || null,
      });
    };


  return (
    <AppLayout>
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Info Portal</Text>

      {/* Project Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.label}>Current Projects</Text>
        <Text style={styles.projectCount}>{projects.length}</Text>
        <Text style={styles.growth}>Growth {growth >= 0 ? '+' : ''}{growth}</Text>
        <Text style={styles.caption}>Ongoing projects last month - {projects.length - growth}</Text>
      </View>

      {/* Project Cards */}
      {projects.map((project, index) => (
        <TouchableOpacity key={index} style={styles.projectCard} onPress={() => handleOpenProject(project)}>
          <View style={[styles.folderIcon, { backgroundColor: getColorByIndex(index) }]} />
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.pageCount}>{project.pages?.length || 0} pages • {project.tasks?.length || 0} tasks</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView></AppLayout>
  );
}

const getColorByIndex = (index: number) => {
  const colors = ['#FEC107', '#00D8B0', '#00B2FF', '#A26EFF'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 36, height: 36 },
  rightHeader: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginHorizontal: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: '700', marginVertical: 16 },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  label: { color: '#777', fontSize: 14 },
  projectCount: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  growth: { color: '#2ECC71', fontWeight: '600' },
  caption: { color: '#999', fontSize: 12 },

  projectCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 12, shadowOpacity: 0.05, shadowRadius: 4,
  },
  folderIcon: {
    width: 36, height: 28, borderRadius: 4, marginRight: 12,
  },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 16, fontWeight: '600' },
  pageCount: { color: '#777', fontSize: 12 },
});
