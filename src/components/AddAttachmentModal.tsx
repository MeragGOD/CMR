import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSend: (data: any) => void;
  type: 'file' | 'link' | null;
};

export default function AddAttachmentModal({ visible, onClose, onSend, type }: Props) {
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');

  const handleLinkSend = () => {
    if (!link.trim()) return;
    onSend({
      type: 'link',
      url: link.trim(),
      name: title || link.trim(),
    });
    reset();
  };

  const handleFilePick = async () => {
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

  if (!res.canceled && res.assets && res.assets.length > 0) {
    const file = res.assets[0];
    const { name, size, uri } = file;

    onSend({
      type: 'file',
      name,
      url: uri,
      size,
    });

    reset();
  }
};


  const reset = () => {
    setLink('');
    setTitle('');
    onClose();
  };

  if (!type) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {type === 'link' ? 'Add Link' : 'Add File'}
            </Text>
            <TouchableOpacity onPress={reset}>
              <Feather name="x" size={22} color="#334155" />
            </TouchableOpacity>
          </View>

          {type === 'link' ? (
            <ScrollView>
              <Text style={styles.label}>Link URL</Text>
              <TextInput
                value={link}
                onChangeText={setLink}
                placeholder="https://example.com"
                style={styles.input}
              />
              <Text style={styles.label}>Display Name (optional)</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Google Docs"
                style={styles.input}
              />

              <TouchableOpacity style={styles.button} onPress={handleLinkSend}>
                <Text style={styles.buttonText}>Send Link</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleFilePick}>
              <Text style={styles.buttonText}>Pick a File</Text>
            </TouchableOpacity>
          )}
        </View>
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
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 4,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
