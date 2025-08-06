  // TaskOverviewScreen.tsx - with back button and header title, removed share folder button

  import React, { useEffect, useState, useMemo } from 'react';
  import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    TextInput,
    Alert,
  } from 'react-native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
  import { Feather } from '@expo/vector-icons';
  import AppLayout from '../../components/AppLayout';
  import ShareFolderModal from './ShareFolderModal';

  interface Task {
    id: string;
    taskName: string;
    createdAt: string;
    updatedAt?: string;
    overviewDescription?: string;
    createdBy: string;
    sharedWith?: string[];
  }


  interface Project {
    id: string;
    name: string;
    createdBy: string;
    sharedWith?: string[];
    tasks?: Task[];
  }

  export default function TaskOverviewScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { project, taskId } = route.params as { project: Project; taskId: string | null };
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [editingOverview, setEditingOverview] = useState(false);
    const [overviewInput, setOverviewInput] = useState('');
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showShareFolderModal, setShowShareFolderModal] = useState(false);


    useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        const filteredTasks = (project.tasks || []).filter(
          t => t.createdBy === user.email || (t.sharedWith || []).includes(user.email)
        );

        setTasks(filteredTasks);
        const first = filteredTasks.find(t => t.id === taskId) || null;
        setSelectedTask(first);
      }
    })();
  }, [project, taskId]);


    const canEdit = useMemo(() => {
      return currentUser && selectedTask && currentUser.email === selectedTask.createdBy;
    }, [currentUser, selectedTask]);

    const reloadProject = async (targetTaskId?: string) => {
    const projectsStr = await AsyncStorage.getItem('projects');
    const projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
    const updated = projects.find(p => p.id === project.id);
    if (!updated || !currentUser) return;

    const filtered = (updated.tasks || []).filter(
      t => t.createdBy === currentUser.email || (t.sharedWith || []).includes(currentUser.email)
    );

    setTasks(filtered);
    const selected = filtered.find(t => t.id === (targetTaskId || selectedTask?.id)) || null;
    setSelectedTask(selected);
  };


    const persistOverview = async (desc: string) => {
      const projectsStr = await AsyncStorage.getItem('projects');
      const projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
      const pjIndex = projects.findIndex(p => p.id === project.id);
      if (pjIndex < 0 || !selectedTask?.id) return;

      const targetProject = projects[pjIndex];
      const taskIndex = (targetProject.tasks || []).findIndex(t => t.id === selectedTask.id);
      if (taskIndex < 0) return;

      const updatedTask = {
        ...targetProject.tasks![taskIndex],
        overviewDescription: desc,
        updatedAt: new Date().toISOString(),
      };

      targetProject.tasks![taskIndex] = updatedTask;
      projects[pjIndex] = { ...targetProject };

      await AsyncStorage.setItem('projects', JSON.stringify(projects));
      await reloadProject(updatedTask.id);
    };

    return (
      <AppLayout>
        <ScrollView style={styles.container}>
          {/* Header: Back to Info Portal + project name */}
          <View style={styles.rowBetween}>
          <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="arrow-left" size={18} color="#1A73E8" />
              <Text style={{ color: '#1A73E8', marginLeft: 6 }}>Back to Info Portal</Text>
          </TouchableOpacity>

          {selectedTask && canEdit && (
              <TouchableOpacity onPress={() => setShowShareFolderModal(true)}>
              <Feather name="share-2" size={18} color="#1A73E8" />
              </TouchableOpacity>
          )}
          </View>


          <Text style={styles.projectTitle}>{project.name}</Text>

          <TouchableOpacity onPress={() => setTaskModalVisible(true)} style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>{selectedTask?.taskName || 'Select Task'}</Text>
            <Feather name="chevron-down" size={18} />
          </TouchableOpacity>

          {selectedTask && (
            <>
              <Text style={styles.modifiedText}>
                Last modified: {new Date(selectedTask.updatedAt || selectedTask.createdAt).toLocaleDateString()}
              </Text>

              <View style={styles.descriptionBox}>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionLabel}>Overview Description</Text>
                  {canEdit && (
                    <TouchableOpacity
                      onPress={() => {
                        setEditingOverview(!editingOverview);
                        setOverviewInput(selectedTask.overviewDescription || '');
                      }}
                    >
                      <Feather name={editingOverview ? 'x' : 'edit-2'} size={18} color="#777" />
                    </TouchableOpacity>
                  )}
                </View>

                {editingOverview ? (
                  <>
                    <TextInput
                      value={overviewInput}
                      onChangeText={setOverviewInput}
                      multiline
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={async () => {
                        await persistOverview(overviewInput);
                        setEditingOverview(false);
                      }}
                      style={{ alignSelf: 'flex-end', marginTop: 8 }}
                    >
                      <Text style={{ color: '#1A73E8', fontWeight: '600' }}>Save</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.valueText}>{selectedTask.overviewDescription || 'No overview description'}</Text>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Modal Task Selector */}
        <Modal visible={taskModalVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.dropdownModal}>
              <Text style={{ fontWeight: '600', marginBottom: 10 }}>Select Task</Text>
              {tasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    const selected = tasks.find(t => t.id === task.id);
                    setSelectedTask(selected || task);
                    setTaskModalVisible(false);
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>{task.taskName}</Text>
                  <Text style={{ color: '#999', fontSize: 12 }}>
                    Last modified: {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
        <ShareFolderModal
          visible={showShareFolderModal}
          onClose={() => setShowShareFolderModal(false)}
          projectId={project.id}
          taskId={selectedTask?.id || ''}
          />


      </AppLayout>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    projectTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#fff',
      marginBottom: 12,
    },
    dropdownText: { fontSize: 16 },
    modifiedText: { fontSize: 12, color: '#999', marginBottom: 12 },
    descriptionBox: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    sectionLabel: { fontWeight: '600', fontSize: 14 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    input: {
      backgroundColor: '#f0f0f5',
      borderRadius: 8,
      padding: 10,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    valueText: { marginTop: 8, color: '#333' },
    overlay: {
      flex: 1,
      backgroundColor: '#00000066',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    dropdownModal: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 12,
      width: '90%',
      maxHeight: '70%',
    },
    dropdownItem: {
      paddingVertical: 10,
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
    },
  });
