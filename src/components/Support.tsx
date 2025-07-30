import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

const SupportModal = ({ visible, onClose }: SupportModalProps) => {
  const [subject, setSubject] = useState('Technical difficulties');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [items] = useState([
    { label: 'Technical difficulties', value: 'Technical difficulties' },
    { label: 'Bug report', value: 'Bug report' },
    { label: 'Feature request', value: 'Feature request' },
    { label: 'Other', value: 'Other' },
  ]);

  const handleSend = () => {
    if (!description.trim()) {
      Alert.alert('Missing description', 'Please enter a description of your request.');
      return;
    }

    // ✅ TODO: Replace with real email API call
    console.log(`📧 Email sent:
Subject: ${subject}
Description: ${description}`);

    Alert.alert('Success', 'Your request has been sent!');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Need some Help?</Text>
          <Text style={styles.subtitle}>
            Describe your question and our specialists will answer you within 24 hours.
          </Text>

          <Text style={styles.label}>Request Subject</Text>
          <DropDownPicker
            open={open}
            value={subject}
            items={items}
            setOpen={setOpen}
            setValue={setSubject}
            containerStyle={{ marginBottom: open ? 120 : 15 }}
            zIndex={1000}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Add some description of the request"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SupportModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0006',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    right: 15,
    top: 10,
    zIndex: 1,
  },
  closeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#555',
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#337DFF',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
