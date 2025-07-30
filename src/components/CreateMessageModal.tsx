import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
};

type User = {
  email: string;
  fullName?: string;
  avatar?: string;
};

type Conversation = {
  id: string;
  type: 'direct' | 'group';
  name: string;
  groupAvatar?: string;
  participants: string[];
  messages: any[];
  updatedAt: string;
};

export default function CreateMessageModal({ visible, onClose, onCreated }: Props) {
  const [mode, setMode] = useState<'select-type' | 'direct' | 'group'>('select-type');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const meStr = await AsyncStorage.getItem('currentUser');
      const me = meStr ? JSON.parse(meStr) : null;
      if (!me) return;

      const memberStr = await AsyncStorage.getItem(`members_${me.email}`);
      const members = memberStr ? JSON.parse(memberStr) : [];

      setCurrentUser(me);
      setAllUsers(members); // ✅ chỉ lấy employee
    };

    if (visible) {
      setMode('select-type');
      setSelectedUsers([]);
      setGroupName('');
      setGroupAvatar(null);
      setSearchText('');
      fetchUsers();
    }
  }, [visible]);

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.email === user.email);
      return exists ? prev.filter((u) => u.email !== user.email) : [...prev, user];
    });
  };

  const pickGroupAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setGroupAvatar(result.assets[0].uri);
    }
  };

  const createConversation = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Current user not found.');
      return;
    }

    const raw = await AsyncStorage.getItem('conversations');
    const list: Conversation[] = raw ? JSON.parse(raw) : [];

    if (mode === 'direct' && selectedUsers.length === 1) {
      const user = selectedUsers[0];
      const exists = list.find(
        (c: Conversation) =>
          c.type === 'direct' &&
          c.participants.includes(currentUser.email) &&
          c.participants.includes(user.email)
      );
      if (exists) {
        onCreated(exists);
        onClose();
        return;
      }

      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        type: 'direct',
        name: user.fullName || user.email,
        participants: [currentUser.email, user.email],
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      list.unshift(newConv);
      await AsyncStorage.setItem('conversations', JSON.stringify(list));
      onCreated(newConv);
      onClose();
    }

    if (mode === 'group' && selectedUsers.length >= 1 && groupName.trim()) {
      const participantEmails = [currentUser.email, ...selectedUsers.map((u) => u.email)].sort();
      const exists = list.find(
        (c: Conversation) =>
          c.type === 'group' &&
          c.name === groupName.trim() &&
          [...c.participants].sort().join(',') === participantEmails.join(',')
      );
      if (exists) {
        onCreated(exists);
        onClose();
        return;
      }

      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        type: 'group',
        name: groupName.trim(),
        groupAvatar: groupAvatar || '',
        participants: participantEmails,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      list.unshift(newConv);
      await AsyncStorage.setItem('conversations', JSON.stringify(list));
      onCreated(newConv);
      onClose();
    }
  };

  const isCreateEnabled =
    (mode === 'direct' && selectedUsers.length === 1) ||
    (mode === 'group' && selectedUsers.length >= 1 && groupName.trim());

  const filteredUsers = allUsers.filter((u) => {
    const search = searchText.toLowerCase();
    return (
      u.email.toLowerCase().includes(search) ||
      u.fullName?.toLowerCase().includes(search)
    );
  });

  const renderUserItem = ({ item }: { item: User }) => {
    const selected = selectedUsers.find((u) => u.email === item.email);
    return (
      <TouchableOpacity
        style={[styles.userItem, selected && styles.userSelected]}
        onPress={() => toggleUser(item)}
      ><Text style={styles.userName}>
          {item.fullName ? `${item.fullName} (${item.email})` : item.email}
        </Text>

        {selected && <Feather name="check" size={16} color="#3b82f6" />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            {mode !== 'select-type' ? (
              <TouchableOpacity onPress={() => setMode('select-type')}>
                <Feather name="arrow-left" size={20} color="#334155" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 20 }} />
            )}
            <Text style={styles.headerText}>
              {mode === 'select-type' && 'New Message'}
              {mode === 'group' && 'New Group Chat'}
              {mode === 'direct' && 'New Direct Message'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          {mode === 'select-type' && (
            <View style={styles.optionBox}>
              <TouchableOpacity style={styles.optionBtn} onPress={() => setMode('group')}>
                <Feather name="users" size={16} />
                <Text style={styles.optionText}>Group Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionBtn} onPress={() => setMode('direct')}>
                <Feather name="user" size={16} />
                <Text style={styles.optionText}>Direct Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'group' && (
            <>
              <TouchableOpacity onPress={pickGroupAvatar} style={styles.avatarPicker}>
                {groupAvatar ? (
                  <Image source={{ uri: groupAvatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="image" size={24} color="#94a3b8" />
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>Pick Group Avatar</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TextInput
                placeholder="Group name"
                value={groupName}
                onChangeText={setGroupName}
                style={styles.input}
              />
            </>
          )}

          {(mode === 'direct' || mode === 'group') && (
            <>
              <TextInput
                placeholder="Search by email or name..."
                value={searchText}
                onChangeText={setSearchText}
                style={styles.input}
              />

              {filteredUsers.length === 0 ? (
                <Text style={{ marginTop: 20, textAlign: 'center' }}>No users found</Text>
              ) : (
                <FlatList
                  data={filteredUsers}
                  keyExtractor={(item) => item.email}
                  renderItem={renderUserItem}
                  style={{ flex: 1, marginVertical: 8 }}
                />
              )}

              {selectedUsers.length > 0 && (
                <Text style={{ textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </Text>
              )}
            </>
          )}

          {(mode === 'direct' || mode === 'group') && (
            <TouchableOpacity
              style={[
                styles.createBtn,
                { backgroundColor: isCreateEnabled ? '#3b82f6' : '#94a3b8' },
              ]}
              disabled={!isCreateEnabled}
              onPress={createConversation}
            >
              <Text style={styles.createBtnText}>Create</Text>
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
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { fontSize: 16, fontWeight: '600' },
  optionBox: {
    marginTop: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  userSelected: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  userName: {
    fontSize: 14,
    color: '#1e293b',
  },
  createBtn: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  avatarPicker: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
