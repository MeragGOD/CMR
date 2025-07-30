import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

interface ShareFolderModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  taskId: string;
}

export default function ShareFolderModal({ visible, onClose, projectId }: ShareFolderModalProps) {
  const [emails, setEmails] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const updateEmail = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const addAnother = () => {
    setEmails([...emails, '']);
  };

  const handleShare = async () => {
    const cleaned = emails.map(e => e.trim()).filter(e => e);
    if (cleaned.length === 0) {
      return Alert.alert('Please enter at least one email');
    }

    setLoading(true);
    const projectsStr = await AsyncStorage.getItem('projects');
    const projects = projectsStr ? JSON.parse(projectsStr) : [];
    const pjIndex = projects.findIndex((p: any) => p.id === projectId);
    if (pjIndex < 0) return;

    const oldShared = projects[pjIndex].sharedWith || [];
    const merged = Array.from(new Set([...oldShared, ...cleaned]));
    projects[pjIndex].sharedWith = merged;

    await AsyncStorage.setItem('projects', JSON.stringify(projects));
    setLoading(false);
    Alert.alert('Shared successfully!');
    onClose();
    setEmails(['']);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Share the Folder</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {emails.map((email, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder="memberemail@gmail.com"
                value={email}
                onChangeText={(val) => updateEmail(index, val)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ))}

            <TouchableOpacity onPress={addAnother}>
              <Text style={styles.addMore}>+ Add another Member</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={loading}
          >
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
  },
  input: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  addMore: {
    color: '#1A73E8',
    fontWeight: '600',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#1A73E8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareText: {
    color: '#fff',
    fontWeight: '700',
  },
});
