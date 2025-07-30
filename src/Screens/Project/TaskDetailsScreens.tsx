import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import AppLayout from '../../components/AppLayout';
import { addNotification } from '../../components/AddNotification';

// ====== Types ======
export type ActivityLog = {
  id: string;
  userEmail: string;
  userName?: string;
  userAvatar?: string;
  message: string;
  createdAt: string; // ISO
};

export type Attachment = {
  id: string;
  type: 'file' | 'link';
  name: string;
  url: string; // file uri or link url
  size?: number;
  mimeType?: string;
};

export type Task = {
  id: string;
  taskName: string;
  taskGroup?: string;
  estimate?: string; // e.g. "2d 4h" OR store minutes. You can adapt
  spentTime?: string; // e.g. "1d 2h"
  priority: 'Low' | 'Medium' | 'High';
  assignee: string; // email
  assigneeName?: string;
  assigneeAvatar?: string;
  createdBy: string; // email
  reporterName?: string;
  reporterAvatar?: string;
  deadline: string; // ISO
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  description?: string;
  createdAt: string; // ISO
  attachments?: Attachment[];
  activity?: ActivityLog[];
  completed?: boolean;
};

export type Project = {
  id: string;
  name: string;
  createdBy: string;
  tasks?: Task[];
};

interface RouteParams {
  projectId: string;
  taskId: string;
}

const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'In Review', 'Done'];

// ====== Helpers ======
const minutesToDh = (totalMinutes: number) => {
  const d = Math.floor(totalMinutes / (60 * 24));
  const h = Math.floor((totalMinutes % (60 * 24)) / 60);
  const m = totalMinutes % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
};

const dhToMinutes = (str?: string) => {
  if (!str) return 0;
  const re = /(\d+)d|(\d+)h|(\d+)m/g;
  let m: RegExpExecArray | null;
  let total = 0;
  while ((m = re.exec(str)) !== null) {
    if (m[1]) total += parseInt(m[1], 10) * 24 * 60;
    if (m[2]) total += parseInt(m[2], 10) * 60;
    if (m[3]) total += parseInt(m[3], 10);
  }
  return total;
};

export default function TaskDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { projectId, taskId } = route.params as RouteParams;
  

  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [taskIndex, setTaskIndex] = useState<number>(-1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // edit modals / states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [logTimeModal, setLogTimeModal] = useState(false);
  const [logHours, setLogHours] = useState('');
  const [logMinutes, setLogMinutes] = useState('');

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [editing, setEditing] = useState(false);
  const [descInput, setDescInput] = useState('');
  const [confirmDoneModal, setConfirmDoneModal] = useState(false);


  useFocusEffect(
    useCallback(() => {
      (async () => {
        const strCU = await AsyncStorage.getItem('currentUser');
        const cu = strCU ? JSON.parse(strCU) : null;
        setCurrentUser(cu);

        const usersStr = await AsyncStorage.getItem('users');
        const u = usersStr ? JSON.parse(usersStr) : [];
        setUsers(u);

        const projectsStr = await AsyncStorage.getItem('projects');
        const projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
        const pj = projects.find(p => p.id === projectId) || null;
        setProject(pj);
        if (!pj) return;

        const idx = (pj.tasks || []).findIndex(t => t.id === taskId);
        setTaskIndex(idx);
        const _task = idx >= 0 ? pj.tasks![idx] : null;
        setTask(_task || null);
      })();
    }, [projectId, taskId])
  );

  const canEdit = useMemo(() => {
  if (!currentUser || !task) return false;
  if (task.completed) return false; // <-- ngăn chỉnh khi đã hoàn tất
  return currentUser.email === task.createdBy || currentUser.email === task.assignee;
}, [currentUser, task]);

  const taskNumber = useMemo(() => {
    if (!project || taskIndex < 0) return '';
    return `PN${project.id.slice(-7)}-${taskIndex + 1}`;
  }, [project, taskIndex]);

  const persistTask = async (patch: Partial<Task>, activityMessage?: string) => {
  if (!project || taskIndex < 0 || !task) return;
  const projectsStr = await AsyncStorage.getItem('projects');
  const projects: Project[] = projectsStr ? JSON.parse(projectsStr) : [];
  const pjIndex = projects.findIndex(p => p.id === project.id);
  if (pjIndex < 0) return;

  const newActivity: ActivityLog | null = activityMessage
    ? {
        id: Date.now().toString(),
        userEmail: currentUser?.email,
        userName: currentUser?.fullName || currentUser?.email,
        userAvatar: currentUser?.avatar,
        message: activityMessage,
        createdAt: new Date().toISOString(),
      }
    : null;

  const newTask: Task = {
    ...task,
    ...patch,
    activity: [
      ...(task.activity || []),
      ...(newActivity ? [newActivity] : []),
    ],
  };

  const newTasks = [...(project.tasks || [])];
  newTasks[taskIndex] = newTask;

  const newProject = { ...project, tasks: newTasks };
  projects[pjIndex] = newProject;

  await AsyncStorage.setItem('projects', JSON.stringify(projects));
  setProject(newProject);
  setTask(newTask);

  // ✅ Gửi notification cho assignee
  if (newActivity && task.assignee && currentUser?.email !== task.assignee) {
    await addNotification({
      type: 'comment',
      message: activityMessage || '',
      taskName: task.taskName,
      actorName: currentUser?.fullName || currentUser?.email,
      actorAvatar: currentUser?.avatar,
      receiver: task.assignee,
      meta: {
        assignee: task.assignee,
        reporter: task.createdBy,
      },
    });
  }

  // ✅ Gửi notification cho reporter
  if (newActivity && task.createdBy && currentUser?.email !== task.createdBy) {
    await addNotification({
      type: 'comment',
      message: activityMessage || '',
      taskName: task.taskName,
      actorName: currentUser?.fullName || currentUser?.email,
      actorAvatar: currentUser?.avatar,
      receiver: task.createdBy,
      meta: {
        assignee: task.assignee,
        reporter: task.createdBy,
      },
    });
  }
};


  const onChangeStatus = async (status: Task['status']) => {
  if (!canEdit) return;

  if (status === 'Done' && !task?.completed) {
    setShowStatusDropdown(false);
    setConfirmDoneModal(true);
  } else {
    await persistTask({ status }, `updated the status to ${status}`);
    setShowStatusDropdown(false);
  }
};
 const approveTaskAsDone = async () => {
  if (!canEdit) return;
  await persistTask(
    { status: 'Done', completed: true },
    'approved the task as completed'
  );
  setConfirmDoneModal(false);
};



  const onChangeDeadline = async (date: Date) => {
    if (!canEdit) return;
    await persistTask({ deadline: date.toISOString() }, `changed deadline to ${date.toDateString()}`);
    setShowDeadlinePicker(false);
  };

  const onLogTime = async () => {
    const h = parseInt(logHours || '0', 10);
    const m = parseInt(logMinutes || '0', 10);
    if (isNaN(h) && isNaN(m)) return;
    const addMinutes = h * 60 + m;
    const total = dhToMinutes(task?.spentTime) + addMinutes;
    await persistTask({ spentTime: minutesToDh(total) }, `logged time ${h || 0}h ${m || 0}m`);
    setLogTimeModal(false);
    setLogHours('');
    setLogMinutes('');
  };

  const onPickFile = async () => {
    if (!canEdit) return;
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled || !res.assets || !res.assets.length) return;
    const f = res.assets[0];
    const newAttach: Attachment = {
      id: Date.now().toString(),
      type: 'file',
      name: f.name || 'file',
      url: f.uri,
      mimeType: f.mimeType,
      size: f.size,
    };
    await persistTask(
      { attachments: [...(task?.attachments || []), newAttach] },
      `attached file ${newAttach.name}`
    );
  };

  const onAddLink = async () => {
    if (!canEdit || !newLink.trim()) return;
    const newAttach: Attachment = {
      id: Date.now().toString(),
      type: 'link',
      name: newLink,
      url: newLink,
    };
    await persistTask(
      { attachments: [...(task?.attachments || []), newAttach] },
      `attached a link`
    );
    setNewLink('');
    setShowAddLinkModal(false);
  };

  if (!task || !project) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
    }
  const reporter = users.find(u => u.email === task.createdBy);
  const reporterAvatar = task.reporterAvatar || reporter?.avatar;
  const assignee = users.find(u => u.email === task.assignee);

  return (
    <AppLayout>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Feather name="arrow-left" size={18} color="#1A73E8" />
        <Text style={{ color: '#1A73E8', marginLeft: 6 }}>Back to Projects</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{task.taskName}</Text>

      {/* Task Info Card */}
      <View style={styles.card}>
        {/* Reporter */}
        <Text style={styles.sectionLabel}>Reporter</Text>
        <View style={styles.personRow}>
          <Image
            source={
              reporterAvatar
                ? { uri: reporterAvatar }
                : require('../../assets/profile.png')
            }
            style={styles.avatar}
          />

          <Text style={styles.personName}>{reporter?.fullName || task.createdBy}</Text>
        </View>

        {/* Assigned */}
        <Text style={styles.sectionLabel}>Assigned</Text>
        <View style={styles.personRow}>
          <Image
            source={assignee?.avatar ? { uri: assignee.avatar } : require('../../assets/profile.png')}
            style={styles.avatar}
          />
          <Text style={styles.personName}>{assignee?.fullName || task.assignee}</Text>
        </View>

        {/* Priority + Deadline */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <Text style={[styles.priorityText, { color: task.priority === 'High' ? '#dc2626' : task.priority === 'Medium' ? '#facc15' : '#22c55e' }]}>
              {task.priority}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Deadline</Text>
            <TouchableOpacity disabled={!canEdit} onPress={() => setShowDeadlinePicker(true)}>
              <Text style={styles.valueText}>{new Date(task.deadline).toDateString()}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {showDeadlinePicker && (
          <DateTimePicker
            value={new Date(task.deadline)}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowDeadlinePicker(false);
              if (date) onChangeDeadline(date);
            }}
          />
        )}

        {/* Time Tracking */}
        <View style={styles.timeTrackingBox}>
          <Text style={styles.sectionLabel}>Time tracking</Text>
          <Text style={styles.valueText}>{task.spentTime || '0h'} logged</Text>
          <Text style={[styles.valueText, { color: '#999', marginTop: 2 }]}>Original Estimate {task.estimate || 'N/A'}</Text>
          <TouchableOpacity style={styles.logButton} onPress={() => (canEdit ? setLogTimeModal(true) : Alert.alert('You do not have permission'))}>
            <Feather name="clock" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#fff', fontWeight: '600' }}>Log time</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Feather name="calendar" size={16} color="#999" />
          <Text style={{ color: '#777', marginLeft: 6 }}>Created {new Date(task.createdAt).toDateString()}</Text>
        </View>
      </View>

      {/* Task Details */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.statusPill, { backgroundColor: '#dbeafe' }]}>
              <Text style={{ color: '#1e3a8a', fontSize: 12, fontWeight: '600' }}>{task.status || 'To Do'}</Text>
            </View>
            {canEdit && (
              <TouchableOpacity onPress={() => setShowStatusDropdown(prev => !prev)} style={{ marginLeft: 6 }}>
                <Feather name="chevron-down" size={16} color="#777" />
              </TouchableOpacity>
            )}
          </View>

          {canEdit && (
            <TouchableOpacity
              onPress={() => {
                setEditing(!editing);
                setDescInput(task.description || '');
              }}
            >
              <Feather name={editing ? 'x' : 'edit-2'} size={18} color="#777" />
            </TouchableOpacity>

          )}
        </View>

        {showStatusDropdown && (
          <View style={styles.dropdown}>
            {STATUSES.map(s => (
              <TouchableOpacity key={s} onPress={() => onChangeStatus(s)} style={styles.dropdownItem}>
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Task Number</Text>
        <Text style={styles.valueText}>{taskNumber}</Text>

        <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Description</Text>
        {editing ? (
          <>
            <TextInput
              value={descInput}
              onChangeText={setDescInput}
              multiline
              style={[styles.input, { marginTop: 8, backgroundColor: '#f0f0f5' }]}
            />
            <TouchableOpacity
              onPress={async () => {
                await persistTask({ description: descInput }, 'updated description');
                setEditing(false);
              }}
              style={{ marginTop: 10, alignSelf: 'flex-end' }}
            >
              <Text style={{ color: '#1A73E8', fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.valueText}>{task.description || '—'}</Text>
        )}


        {/* Attachments quick actions */}
        {canEdit && (
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
            <TouchableOpacity style={styles.attachBtn} onPress={onPickFile}>
              <Feather name="paperclip" size={18} color="#7c3aed" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={() => setShowAddLinkModal(true)}>
              <Feather name="link" size={18} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
        )}

        {/* Attachments list */}
        {task.attachments && task.attachments.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>Task Attachments ({task.attachments.length})</Text>
            {task.attachments.map(att => (
          <View key={att.id} style={styles.attachmentRow}>
            <View style={styles.attachmentLeft}>
              <Feather name={att.type === 'file' ? 'paperclip' : 'link'} size={18} color="#7c3aed" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontWeight: '600' }}>{att.name}</Text>
                <Text style={{ color: '#999', fontSize: 12 }}>{att.type.toUpperCase()}</Text>
              </View>
            </View>
            {editing ? (
              <TouchableOpacity
                onPress={async () => {
                  const newAttachments = (task.attachments || []).filter(a => a.id !== att.id);
                  await persistTask({ attachments: newAttachments }, `removed attachment ${att.name}`);
                }}
              >
                <Feather name="x" size={18} color="#ef4444" />
              </TouchableOpacity>
            ) : (
              <Feather name="more-horizontal" size={20} color="#999" />
            )}
  </View>
))}

          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        {(task.activity || []).length === 0 && (
          <Text style={{ color: '#777' }}>No activity yet.</Text>
        )}
        {(task.activity || [])
          .slice()
          .reverse()
          .map(log => (
            <View key={log.id} style={styles.activityRow}>
              <Image
                source={log.userAvatar ? { uri: log.userAvatar } : require('../../assets/profile.png')}
                style={styles.avatar}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: '600' }}>{log.userName || log.userEmail}</Text>
                <Text style={{ color: '#555' }}>{log.message}</Text>
                <Text style={{ color: '#999', fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()}</Text>
              </View>
            </View>
          ))}
      </View>

      {/* Log Time Modal */}
      <Modal visible={logTimeModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.innerModal}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Log time</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                style={styles.timeInput}
                placeholder="h"
                keyboardType="numeric"
                value={logHours}
                onChangeText={setLogHours}
              />
              <TextInput
                style={styles.timeInput}
                placeholder="m"
                keyboardType="numeric"
                value={logMinutes}
                onChangeText={setLogMinutes}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setLogTimeModal(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#777' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onLogTime}>
                <Text style={{ color: '#1A73E8', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={confirmDoneModal} transparent animationType="fade">
  <View style={styles.overlay}>
    <View style={[styles.innerModal, { alignItems: 'center' }]}>
      <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 10 }}>Are you sure you are claiming this task?</Text>
      <Text style={{ textAlign: 'center', color: '#555', marginBottom: 20 }}>
        The task will be moved to the Completed section and will be closed.
      </Text>
      <TouchableOpacity
        onPress={approveTaskAsDone}
        style={{
          backgroundColor: '#1A73E8',
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: 14,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Approve Task</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setConfirmDoneModal(false)} style={{ marginTop: 16 }}>
        <Text style={{ color: '#999' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      {/* Add Link Modal */}
      <Modal visible={showAddLinkModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.innerModal}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Attach link</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={newLink}
              onChangeText={setNewLink}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setShowAddLinkModal(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#777' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onAddLink}>
                <Text style={{ color: '#1A73E8', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView></AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionLabel: { color: '#777', fontSize: 12, marginTop: 10 },
  personRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  personName: { marginLeft: 8, fontWeight: '600', color: '#111' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  priorityText: { fontWeight: '600' },
  valueText: { fontSize: 14, color: '#222', marginTop: 4 },
  timeTrackingBox: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginTop: 12 },
  logButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 8,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  attachmentRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  attachmentLeft: { flexDirection: 'row', alignItems: 'center' },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionHeader: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  innerModal: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: '100%',
    padding: 16,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    borderRadius: 8,
    padding: 10,
  },
  input: {
    backgroundColor: '#f0f0f5',
    borderRadius: 8,
    padding: 10,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
