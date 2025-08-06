import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../../components/AppLayout';

const defaultAvatar = require('../../assets/profile.png');

interface Task {
  assignee: string;
  assigneeName?: string;
  assigneeAvatar?: string;
}

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
}

export default function ProjectDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { project } = route.params as { project: Project };

  const [description, setDescription] = useState(project.description);
  const [modalVisible, setModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [enrichedTasks, setEnrichedTasks] = useState<Task[]>([]);


  useFocusEffect(() => {
    const fetchUsers = async () => {
      const usersStr = await AsyncStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      setAllUsers(users);

      // enrich tasks
      const enriched = (project.tasks || []).map(t => {
        const user = users.find((u: { email: string; }) => u.email === t.assignee);
        return {
          ...t,
          assigneeName: user?.fullName || t.assignee,
          assigneeAvatar: user?.avatar || '',
        };
      });
      setEnrichedTasks(enriched);
    };
    fetchUsers(); 
  },);
  


  const reporterUser = allUsers.find(u => u.email === project.createdBy);
  const reporter = {
    name:
      typeof reporterUser?.fullName === 'string'
        ? reporterUser.fullName
        : reporterUser?.fullName?.name || project.createdBy,
    avatar: reporterUser?.avatar || '',
  };

  const assigneesMap = new Map<string, { name: string; avatar: string }>();
enrichedTasks.forEach(t => {
  if (!assigneesMap.has(t.assignee)) {
    assigneesMap.set(t.assignee, {
      name: t.assigneeName || t.assignee,
      avatar: t.assigneeAvatar || '',
    });
  }
});
const assignees = Array.from(assigneesMap.values());



  return (
    <View style={styles.container}>
      <AppLayout>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
            <Feather name="arrow-left" size={16} color="#3b82f6" />
            <Text style={styles.backText}>Back to Projects</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{project.name}</Text>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.rowSpace}>
              <View>
                <Text style={styles.label}>Project Number</Text>
                <Text style={styles.projectId}>PN{project.id.slice(-7)}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Feather name="edit-3" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={[styles.label, { marginTop: 16 }]}>Description</Text>
            <Text style={styles.description}>{description || 'No description'}</Text>

            {/* Reporter */}
            <Text style={styles.label}>Reporter</Text>
            <View style={styles.rowCenter}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={reporter.avatar ? { uri: reporter.avatar } : defaultAvatar}
                  style={styles.avatarImage}
                />
              </View>
              <Text style={styles.reporterText}>{reporter.name}</Text>
            </View>

            {/* Assignees + Priority */}
            <View style={[styles.rowSpace, { marginTop: 16 }]}>
              <View>
                <Text style={styles.label}>Assignees</Text>
                <View style={[styles.assigneeRow, { marginTop: 6 }]}>
                  {assignees.length === 0 ? (
                    <Text style={{ color: '#888' }}>None</Text>
                  ) : (
                    assignees.slice(0, 3).map((a, idx) => (
                      <View key={idx} style={[styles.avatarWrapper, { marginLeft: idx === 0 ? 0 : -12 }]}>
                        <Image
                          source={a.avatar ? { uri: a.avatar } : defaultAvatar}
                          style={styles.avatarImage}
                        />
                      </View>
                    ))
                  )}
                  {assignees.length > 3 && (
                    <View style={[styles.moreAvatar, { marginLeft: -12 }]}>
                      <Text style={{ color: '#2563eb', fontSize: 12 }}>
                        +{assignees.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View>
                <Text style={styles.label}>Priority</Text>
                <Text style={[styles.priority, { color: '#eab308' }]}>↑ {project.priority}</Text>
              </View>
            </View>

            {/* Deadline */}
            <Text style={styles.label}>Deadline</Text>
            <Text style={styles.detailText}>
              {new Date(project.deadline).toDateString()}
            </Text>

            {/* Created */}
            <View style={styles.rowCenter}>
              <Feather name="calendar" size={16} color="#94a3b8" />
              <Text style={styles.createdText}>
                Created {new Date(project.startDate).toDateString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      </AppLayout>

      {/* Edit Description Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Edit Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#ef4444' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#10b981' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef3fe' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { color: '#3b82f6', fontSize: 14, marginLeft: 6 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 12,
  },
  projectId: {
    fontWeight: '600',
    fontSize: 14,
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
    color: '#334155',
  },
  reporterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginLeft: 8,
  },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  moreAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priority: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 6,
  },
  detailText: {
    fontSize: 14,
    marginTop: 4,
    color: '#334155',
  },
  createdText: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 6,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
