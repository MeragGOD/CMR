// src/components/ProfileTabs/ProjectsTab.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatarImages = [
  require('../../assets/Image.png'),
  require('../../assets/Image (1).png'),
  require('../../assets/Image (2).png'),
  require('../../assets/Image (3).png'),
];

const ProjectsTab = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(user);

      const projectStr = await AsyncStorage.getItem('projects');
      const allProjects = projectStr ? JSON.parse(projectStr) : [];

      const filtered = allProjects.filter(
        (p: any) => p.createdBy === user?.email
      );
      setProjects(filtered);
    };

    loadData();
  }, []);

  if (projects.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>No projects found.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {projects.map((project, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.headerRow}>
            {project.avatarIndex !== null && avatarImages[project.avatarIndex] && (
              <Image source={avatarImages[project.avatarIndex]} style={styles.avatar} />
            )}
            <View>
              <Text style={styles.title}>{project.name}</Text>
              <Text style={styles.meta}>Project ID: PN{project.id}</Text>
            </View>
          </View>
          <Text style={styles.meta}>Created by: {project.createdBy}</Text>
          <Text style={styles.meta}>Start: {new Date(project.startDate).toLocaleDateString()}</Text>
          <Text style={styles.meta}>Deadline: {new Date(project.deadline).toLocaleDateString()}</Text>
          <Text style={styles.data}>{project.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default ProjectsTab;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  data: {
    fontSize: 13,
    color: '#333',
  },
});
