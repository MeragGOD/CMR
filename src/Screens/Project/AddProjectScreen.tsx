import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatarImages = [
  require('../../assets/Image.png'),
  require('../../assets/Image (1).png'),
  require('../../assets/Image (2).png'),
  require('../../assets/Image (3).png'),
];

export type Project = {
  id: string;
  name: string;
  startDate: string;
  deadline: string;
  priority: string;
  description: string;
  avatarIndex: number | null;
  hasAttachment: boolean;
  hasLink: boolean;
  attachmentUri?: string;
  attachmentName?: string;
  linkUrl?: string;
  createdBy: string;
  createdAt: string;
};

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddProjectModal({ visible, onClose }: AddProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [isLinkSelected, setIsLinkSelected] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleSave = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        Alert.alert('Error', 'User not found.');
        return;
      }

      const project: Project = {
        id: Date.now().toString(),
        name: projectName,
        startDate: startDate.toISOString(), // convert Date → string
        deadline: deadline.toISOString(),   // convert Date → string
        priority,
        description,
        avatarIndex: selectedAvatar,
        hasAttachment: !!attachmentFile,
        hasLink: isLinkSelected,
        attachmentUri: attachmentFile?.uri,
        attachmentName: attachmentFile?.name,
        linkUrl: linkText,
        createdBy: user.email,
        createdAt: new Date().toISOString(),
      };

      const storedProjects = await AsyncStorage.getItem('projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];

      const updatedProjects = [...projects, project];
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));

      Alert.alert('Success', 'Project saved successfully');
      resetForm();
      onClose();
    } catch (e) {
      console.error('Error saving project:', e);
      Alert.alert('Error', 'Could not save project.');
    }
  };
  const handleClose = () => {
  resetForm();
  onClose();
};


  const resetForm = () => {
    setProjectName('');
    setStartDate(new Date());
    setDeadline(new Date());
    setPriority('Medium');
    setDescription('');
    setSelectedAvatar(null);
    setIsLinkSelected(false);
    setLinkText('');
    setAttachmentFile(null);
  };

  const handlePickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.assets && result.assets.length > 0 && !result.canceled) {
        setAttachmentFile(result.assets[0]);
      }
    } catch (e) {
      console.log('Document pick error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Project</Text>
              <TouchableOpacity onPress={handleClose}>
                <Feather name="x" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Project Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={projectName}
              onChangeText={setProjectName}
            />

            <Text style={styles.label}>Starts</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
              <Text>{startDate.toDateString()}</Text>
              <Feather name="calendar" size={18} />
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDeadlinePicker(true)}>
              <Text>{deadline.toDateString()}</Text>
              <Feather name="calendar" size={18} />
            </TouchableOpacity>
            {showDeadlinePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDeadlinePicker(false);
                  if (date) setDeadline(date);
                }}
              />
            )}

            <Text style={styles.label}>Priority</Text>
            <View style={styles.picker}>
              <Picker selectedValue={priority} onValueChange={setPriority}>
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Add some description of the project"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.sectionTitle}>Select image</Text>
            <Text style={styles.sectionSubtitle}>
              Select or upload an avatar for the project
            </Text>
            <View style={styles.avatarGrid}>
              {avatarImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedAvatar(index)}
                  style={[
                    styles.avatarWrapper,
                    selectedAvatar === index && styles.avatarSelected,
                  ]}
                >
                  <Image source={img} style={styles.avatar} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.attachmentContainer}>
              <TouchableOpacity
                style={[
                  styles.attachmentBox,
                  attachmentFile && styles.attachmentBoxSelected,
                ]}
                onPress={handlePickAttachment}
              >
                <Feather name="paperclip" size={20} color="#7c3aed" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.attachmentBox,
                  isLinkSelected && styles.attachmentBoxSelected,
                ]}
                onPress={() => {
                  setIsLinkSelected(true);
                  setShowLinkInput(true);
                }}
              >
                <Feather name="link" size={20} color="#0ea5e9" />
              </TouchableOpacity>
            </View>

            {attachmentFile && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.fileName}>Attached: {attachmentFile.name}</Text>
                <TouchableOpacity onPress={() => setAttachmentFile(null)}>
                  <Feather name="x" size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save Project</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Link input modal */}
        <Modal visible={showLinkInput} transparent animationType="fade">
          <View style={styles.inputOverlay}>
            <View style={styles.inputModal}>
              <Text style={styles.label}>Enter Link</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                value={linkText}
                onChangeText={setLinkText}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity onPress={() => setShowLinkInput(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={() => {
                  if (linkText.trim()) {
                    setIsLinkSelected(true); // đánh dấu là có link
                    setShowLinkInput(false);
                  } else {
                    Alert.alert('Invalid', 'Please enter a valid link.');
                  }
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
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
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picker: {
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    padding: 4,
  },
  avatarSelected: {
    borderColor: '#007bff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  attachmentContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  attachmentBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentBoxSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#6366f1',
    borderWidth: 2,
  },
  fileName: {
    fontSize: 12,
    color: '#333',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputModal: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
});
