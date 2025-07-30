import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AddMemberModal: React.FC<Props> = ({ visible, onClose }) => {
  const [emails, setEmails] = useState(['']);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setEmails(['']);
      fetchCurrentUser();
    }
  }, [visible]);

  const fetchCurrentUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      } else {
        Alert.alert('Error', 'No current user found.');
        onClose();
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
      Alert.alert('Error', 'Failed to load user.');
      onClose();
    }
  };

  const handleEmailChange = (text: string, index: number) => {
    const newEmails = [...emails];
    newEmails[index] = text;
    setEmails(newEmails);
  };

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleClose = () => {
    setEmails(['']);
    onClose();
  };

  const handleApprove = async () => {
    if (!currentUser || !currentUser.email) {
      Alert.alert('Error', 'No current user found.');
      return;
    }

    try {
      const cleanedEmails = emails
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      if (cleanedEmails.length === 0) {
        Alert.alert('No emails entered');
        return;
      }

      const newMembers = cleanedEmails.map((email) => ({
        email,
        role: 'assignee',
        createdBy: currentUser.email,
      }));

      const storageKey = `members_${currentUser.email}`;
      const existing = await AsyncStorage.getItem(storageKey);
      const parsed = existing ? JSON.parse(existing) : [];

      const existingEmails = parsed.map((m: any) => m.email);
      const uniqueNewMembers = newMembers.filter(
        (m) => !existingEmails.includes(m.email)
      );

      const updatedMembers = [...parsed, ...uniqueNewMembers];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedMembers));

      handleClose();
    } catch (error) {
      console.error('Error saving members:', error);
      Alert.alert('Error', 'Failed to save members.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeIcon} onPress={handleClose}>
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>

              <Text style={styles.title}>Add Employee</Text>

              <ScrollView style={{ maxHeight: 250 }}>
                {emails.map((email, index) => (
                  <TextInput
                    key={index}
                    placeholder="memberemail@gmail.com"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => handleEmailChange(text, index)}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity onPress={handleAddEmail}>
                <Text style={styles.addMore}>+ Add another Member</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddMemberModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  closeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#000',
  },
  addMore: {
    color: '#377DFF',
    fontWeight: '500',
    fontSize: 14,
    marginVertical: 10,
  },
  approveButton: {
    backgroundColor: '#377DFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  approveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
