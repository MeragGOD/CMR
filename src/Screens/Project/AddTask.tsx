import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';


type Project = {
  id: string;
  name: string;
  tasks?: any[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const taskGroups = ['Design', 'Development', 'Testing', 'Marketing', 'Project Management'];
const priorities = ['Low', 'Medium', 'High'];

export default function AddTaskModal({ visible, onClose }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskGroup, setTaskGroup] = useState(taskGroups[0]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(priorities[1]);
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState('');
  const [link, setLink] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [assignee, setAssignee] = useState<{ name: string; email: string } | null>(null);
  const [assignees, setAssignees] = useState<{ name: string; email: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);


  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);


  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTaskGroupDropdown, setShowTaskGroupDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    if (visible) loadProjects();
  }, [visible]);

  const loadProjects = async () => {
  const projectData = await AsyncStorage.getItem('projects');
  const userData = await AsyncStorage.getItem('currentUser');

  if (!projectData || !userData) return;

  const allProjects = JSON.parse(projectData);
  const user = JSON.parse(userData);
  setCurrentUser(user);

  const userProjects = allProjects.filter((p: any) => p.createdBy === user.email);
  setProjects(userProjects);

  if (userProjects.length > 0) setSelectedProjectId(userProjects[0].id);
  else setSelectedProjectId(null);

  // 🔽 Load assignees
  const membersStr = await AsyncStorage.getItem(`members_${user.email}`);
  const members = membersStr ? JSON.parse(membersStr) : [];

  const profilesStr = await AsyncStorage.getItem('userProfiles');
  const profiles = profilesStr ? JSON.parse(profilesStr) : {};

 const assigneesFromMembers = members
  .filter((m: any) => m.role === 'assignee')
  .map((m: any) => ({
    email: m.email,
    name: profiles[m.email]?.name || m.email,
  }));

const currentUserAsAssignee = {
  email: user.email,
  name: profiles[user.email]?.name || user.email,
};

// Nếu current user chưa có trong danh sách, thì thêm vào
const alreadyIncluded = assigneesFromMembers.some((a: { email: string; name: string }) => a.email === user.email);
const allAssignees = alreadyIncluded
  ? assigneesFromMembers
  : [currentUserAsAssignee, ...assigneesFromMembers];

setAssignees(allAssignees);
console.log('✅ Assignees:', allAssignees);

};



  const resetForm = () => {
    setTaskName('');
    setTaskGroup(taskGroups[0]);
    setDeadline(null);
    setPriority(priorities[1]);
    setAssignee(null);
    setDescription('');
    setAttachment('');
    setLink('');
    setSelectedProjectId(projects[0]?.id || null);
  };

  const calculateEstimate = (createdAt: Date, deadline: Date): string => {
    const diffMs = deadline.getTime() - createdAt.getTime();
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleSave = async () => {
    if (!selectedProjectId || !taskName || !deadline) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return;
    }

    const createdAt = new Date();
    const estimate = calculateEstimate(createdAt, deadline);

    const task = {
      id: Date.now().toString(),
      taskName,
      taskGroup,
      estimate,
      deadline: deadline.toISOString(),
      priority,    
      assignee: assignee?.email || '',       // Lưu email
      assigneeName: assignee?.name || '',    // Lưu name riêng
      description,
      status: 'To Do',
      attachment,
      link,
      createdAt: createdAt.toISOString(),
      createdBy: currentUser.email,
    };

    const stored = await AsyncStorage.getItem('projects');
    const allProjects = stored ? JSON.parse(stored) : [];

    const updated = allProjects.map((p: Project) =>
      p.id === selectedProjectId ? { ...p, tasks: [...(p.tasks || []), task] } : p
    );

    await AsyncStorage.setItem('projects', JSON.stringify(updated));
    Alert.alert('Success', 'Task saved');
    resetForm();
    onClose();
  };
  

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Task</Text>
              <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
                <Feather name="x" size={24} />
              </TouchableOpacity>
            </View>

            {/* Project Dropdown */}
            <Text style={styles.label}>Project</Text>
            <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowProjectDropdown(true)}>
              <Text style={styles.dropdownText}>
                {projects.find(p => p.id === selectedProjectId)?.name || 'Select Project'}
              </Text>
              <Feather name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>

            {/* Task Name */}
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              value={taskName}
              onChangeText={setTaskName}
            />

            {/* Task Group */}
            <Text style={styles.label}>Task Group</Text>
            <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowTaskGroupDropdown(true)}>
              <Text style={styles.dropdownText}>{taskGroup}</Text>
              <Feather name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>

            {/* Deadline */}
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputFlex}>
                {deadline?.toLocaleString() || 'Select Deadline'}
              </Text>
              <Feather name="calendar" size={18} color="#aaa" />
            </TouchableOpacity>

            {deadline && (
              <Text style={{ color: '#555', fontSize: 13, marginBottom: 8 }}>
                Estimate: {calculateEstimate(new Date(), deadline)}
              </Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (selectedDate) {
                    const current = deadline || new Date();
                    const updated = new Date(current);
                    updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setDeadline(updated);
                    setShowTimePicker(true); // Mở chọn giờ sau khi chọn ngày
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  if (Platform.OS === 'android') setShowTimePicker(false);
                  if (selectedTime && deadline) {
                    const updated = new Date(deadline);
                    updated.setHours(selectedTime.getHours());
                    updated.setMinutes(selectedTime.getMinutes());
                    setDeadline(updated);
                  }
                }}
              />
            )}
            {/* Priority */}
            <Text style={styles.label}>Priority</Text>
            <TouchableOpacity style={styles.dropdownBox} onPress={() => setShowPriorityDropdown(true)}>
              <Text style={styles.dropdownText}>{priority}</Text>
              <Feather name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>

            {/* Assignee */}
            <Text style={styles.label}>Assignee</Text>
            <TouchableOpacity
              style={styles.dropdownBox}
              onPress={() => setShowAssigneeDropdown(true)}
            >
              <Text style={styles.dropdownText}>
                {assignee ? `${assignee.name} (${assignee.email})` : 'Select Assignee'}
              </Text>
              <Feather name="chevron-down" size={16} color="#555" />
            </TouchableOpacity>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Add some description of the task"
              value={description}
              onChangeText={setDescription}
            />

            {/* Attachment */}
            
            <Text style={styles.label}>Attachment / Link</Text>
<View style={styles.iconRow}>
  <TouchableOpacity
    style={[
      styles.iconBox,
      !!attachment && styles.iconBoxSelected,
    ]}
    onPress={async () => {
      setLink('');
      setShowLinkModal(false);
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.assets && result.assets.length > 0 && !result.canceled) {
      setAttachment(result.assets[0].name);
}

    }}
  >
    <Feather name="paperclip" size={20} color="#7c3aed" />
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.iconBox,
      !!link && styles.iconBoxSelected,
    ]}
    onPress={() => {
      setAttachment('');
      setShowAttachmentModal(false);
      setShowLinkModal(true);
    }}
  >
    <Feather name="link" size={20} color="#0ea5e9" />
  </TouchableOpacity>
</View>

{attachment ? <Text style={styles.previewText}>Attached: {attachment}</Text> : null}
{link ? <Text style={styles.previewText}>Link: {link}</Text> : null}

            {/* Save */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Dropdown Modals */}
          {renderDropdown(showProjectDropdown, setShowProjectDropdown, projects.map(p => p.name), (value) => {
            const proj = projects.find(p => p.name === value);
            if (proj) setSelectedProjectId(proj.id);
          })}
          {renderDropdown(showTaskGroupDropdown, setShowTaskGroupDropdown, taskGroups, setTaskGroup)}
          {renderDropdown(showPriorityDropdown, setShowPriorityDropdown, priorities, setPriority)}
          {renderDropdown(
              showAssigneeDropdown,
              setShowAssigneeDropdown,
              assignees.map(a => `${a.name} (${a.email})`),
              (value) => {
                const found = assignees.find(a => `${a.name} (${a.email})` === value);
                if (found) setAssignee(found);
              }
            )}



          {/* Custom Input Modals */}
          <TextInputModal
            visible={showAttachmentModal}
            title="Add Attachment"
            placeholder="Enter attachment name"
            initialValue={attachment}
            onClose={() => setShowAttachmentModal(false)}
            onSave={setAttachment}
          />
          <TextInputModal
            visible={showLinkModal}
            title="Add Link"
            placeholder="Paste link here"
            initialValue={link}
            onClose={() => setShowLinkModal(false)}
            onSave={setLink}
          />
        </View>
      </View>
    </Modal>
  );
}

function renderDropdown(
  visible: boolean,
  onClose: (v: boolean) => void,
  options: string[],
  onSelect: (value: string) => void
) {
  return visible ? (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={() => onClose(false)}>
        <View style={styles.dropdown}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(option);
                onClose(false);
              }}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  ) : null;
}

function TextInputModal({
  visible,
  title,
  placeholder,
  initialValue,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [text, setText] = useState(initialValue || '');

  useEffect(() => {
    setText(initialValue || '');
  }, [visible]);

  return visible ? (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { width: '80%' }]}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{title}</Text>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            placeholder={placeholder}
            value={text}
            onChangeText={setText}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
              <Text style={{ color: '#888' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(text); onClose(); }}>
              <Text style={{ color: '#007AFF', fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  ) : null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '95%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  iconRow: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 12,
  marginTop: 12,
  marginBottom: 16,
},
iconBox: {
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
iconBoxSelected: {
  backgroundColor: '#e0e7ff',
  borderWidth: 2,
  borderColor: '#6366f1',
},
previewText: {
  fontSize: 13,
  color: '#555',
  marginTop: -4,
  marginBottom: 8,
},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  inputFlex: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dropdownBox: {
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdown: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignSelf: 'center',
    marginTop: '50%',
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },
  addButtonText: {
    color: '#007AFF',
    marginLeft: 8,
  },
  attachmentPreview: {
    marginTop: 4,
    fontSize: 13,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
