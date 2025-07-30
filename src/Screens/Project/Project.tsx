// src/Screens/Project/Project.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../../components/AppLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import TaskFilterModal from './FilterTaskModal';
import { Task } from './Task';

interface Project {
  id: string;
  name: string;
  startDate: string;
  deadline: string;
  priority: string;
  description: string;
  avatarIndex: number | null;
  hasAttachment: boolean;
  hasLink: boolean;
  createdBy: string;
  tasks?: Task[];
  createdAt: string;
}

const enrichTasksWithUserInfo = (tasks: Task[], users: any[]): Task[] => {
  return tasks.map(task => {
    const matchedUser = users.find((u: any) => u.email === task.assignee);
    const fullName =
      typeof matchedUser?.fullName === 'string'
        ? matchedUser.fullName
        : matchedUser?.fullName?.name || task.assignee;

    return {
      ...task,
      assigneeName: fullName,
      assigneeAvatar: matchedUser?.avatar || null,
    };
  });
};

export default function ProjectScreen() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Project'>;
  const navigation = useNavigation<NavigationProp>();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[] | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const loadProjects = async () => {
  const userStr = await AsyncStorage.getItem('currentUser');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  if (!currentUser) return;

  const usersStr = await AsyncStorage.getItem('users');
  const users = usersStr ? JSON.parse(usersStr) : [];

  setAllUsers(users); // ✅ đúng rồi

  const allProjectsJson = await AsyncStorage.getItem('projects');
  const allProjects: Project[] = allProjectsJson ? JSON.parse(allProjectsJson) : [];
  const userProjects = allProjects.filter(p => {
  if (p.createdBy === currentUser.email) return true; // Là người tạo
  const hasTaskAssigned = (p.tasks || []).some(t => t.assignee === currentUser.email);
  return hasTaskAssigned; // Là assignee trong 1 task của project này
});

  setProjects(userProjects);

  const firstProject = userProjects[0] || null;
  setSelectedProject(firstProject);

  if (firstProject) {
    const enriched = enrichTasksWithUserInfo(firstProject.tasks || [], users);
    setTasks(enriched);
  }
};

  useFocusEffect(
  useCallback(() => {
    loadProjects();
  }, [])
);

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'In Progress': return { backgroundColor: '#dbeafe' };
      case 'In Review': return { backgroundColor: '#f5d0fe' };
      case 'To Do': return { backgroundColor: '#e5e7eb' };
      default: return { backgroundColor: '#d1fae5' };
    }
  };

  const renderProjectCard = () => {
    if (!selectedProject) return null;

    return (
      <View style={styles.projectCard}>
        <View style={styles.cardLeft}>
          <Text style={styles.projectId}>PN{selectedProject.id.slice(-7)}</Text>
          <Text style={styles.projectName}>{selectedProject.name}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProjectDetails', { project: selectedProject })}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={styles.viewDetails}>View details</Text>
            <Feather name="chevron-right" size={14} color="#1A73E8" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setShowDropdown(true)} style={{ padding: 6 }}>
          <Feather name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTasks = () => {
    const displayTasks = filteredTasks ?? tasks;
    if (displayTasks.length === 0) {
      return (
        <View style={styles.illustration}>
          <Image source={require('../../assets/Illustration.png')} style={styles.illustrationImage} />
          <Text style={styles.taskEmpty}>
            {filteredTasks ? 'No tasks matched your filters.' : 'No tasks in this project yet.'}
          </Text>
        </View>
      );
    }

    return displayTasks.map(task => (
  <TouchableOpacity
    key={task.id}
    onPress={() => navigation.navigate('TaskDetails', {
      projectId: selectedProject?.id || '',
      taskId: task.id,
    })}
    style={styles.taskCard}
    activeOpacity={0.9}
  >
    {/* Giữ nguyên nội dung hiển thị task */}
      <Text style={styles.taskLabel}>Task Name</Text>
      <Text style={styles.taskTitleText}>{task.taskName}</Text>
      <View style={styles.taskRowSeparator} />
      <View style={styles.taskRow}>
        <View style={styles.taskColumn}>
          <Text style={styles.taskSubLabel}>Estimate</Text>
          <Text style={styles.taskValue}>{task.estimate || 'N/A'}</Text>
        </View>
        <View style={styles.taskColumn}>
          <Text style={styles.taskSubLabel}>Spent Time</Text>
          <Text style={styles.taskValue}>{task.spentTime || '0h'}</Text>
        </View>
        <View style={styles.taskColumn}>
          <Text style={styles.taskSubLabel}>Assignee</Text>
          <Image
            source={task.assigneeAvatar ? { uri: task.assigneeAvatar } : require('../../assets/profile.png')}
            style={styles.avatar}
          />
          <Text style={styles.assigneeName}>{task.assigneeName || task.assignee}</Text>
        </View>
      </View>
      <View style={styles.taskRowBottom}>
        <View style={styles.priorityWrapper}>
          <Feather
            name={task.priority === 'High' ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={
              task.priority === 'High'
                ? '#dc2626'
                : task.priority === 'Medium'
                ? '#facc15'
                : '#22c55e'
            }
          />
          <Text
            style={[
              styles.priorityText,
              {
                color:
                  task.priority === 'High'
                    ? '#dc2626'
                    : task.priority === 'Medium'
                    ? '#facc15'
                    : '#22c55e',
              },
            ]}
          >
            {task.priority}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(task.status)]}>
          <Text style={styles.statusText}>{task.status || 'Done'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ));

  };

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Projects</Text>
        {renderProjectCard()}
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>Tasks</Text>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Feather name="filter" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {renderTasks()}
      </ScrollView>

      <TaskFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        tasks={tasks}
        allUsers={allUsers}
        onApply={filtered => setFilteredTasks(filtered)}
      />

      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={projects}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={async () => {
                    const usersStr = await AsyncStorage.getItem('users');
                    const users = usersStr ? JSON.parse(usersStr) : [];
                    const enriched = enrichTasksWithUserInfo(item.tasks || [], users);
                    setSelectedProject(item);
                    setTasks(enriched);
                    setFilteredTasks(null);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  projectCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, paddingRight: 12, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#1A73E8', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 4 },
  cardLeft: { flex: 1 },
  projectId: { color: '#999', fontSize: 12 },
  projectName: { fontSize: 16, fontWeight: '600', marginVertical: 4 },
  viewDetails: { color: '#1A73E8', fontSize: 13 },
  taskTitle: { fontSize: 18, fontWeight: '600' },
  illustration: { alignItems: 'center', justifyContent: 'center' },
  illustrationImage: { width: 180, height: 180 },
  taskEmpty: { color: '#555', marginTop: 8, fontSize: 14 },
  taskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: 3 },
  taskLabel: { fontSize: 12, color: '#999' },
  taskTitleText: { fontSize: 16, fontWeight: '600', color: '#111' },
  taskRowSeparator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskColumn: { flex: 1, alignItems: 'center' },
  taskSubLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  taskValue: { fontSize: 14, fontWeight: '600' },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  assigneeName: { fontSize: 12, color: '#333', marginTop: 4 },
  taskRowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priorityText: { fontSize: 13, fontWeight: '600' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#222' },
  overlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'center', alignItems: 'center' },
  dropdown: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 10 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  dropdownText: { fontSize: 16 },
});