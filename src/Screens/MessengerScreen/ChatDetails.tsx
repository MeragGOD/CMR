  import React, { useEffect, useState, useCallback } from 'react';
  import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Modal, TextInput, Alert
  } from 'react-native';
  import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Feather } from '@expo/vector-icons';
  import AppLayout from '../../components/AppLayout';

  const defaultAvatar = require('../../assets/profile.png');

  export default function ChatDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { conversationId } = route.params as { conversationId: string };

    const [conversation, setConversation] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    const [showSearch, setShowSearch] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAction, setShowAction] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [kickMode, setKickMode] = useState(false);

    const loadConversation = async () => {
    const convosStr = await AsyncStorage.getItem('conversations');
    const usersStr = await AsyncStorage.getItem('users');
    const currentStr = await AsyncStorage.getItem('currentUser');

    const convos = convosStr ? JSON.parse(convosStr) : [];
    const userList = usersStr ? JSON.parse(usersStr) : [];
    const current = currentStr ? JSON.parse(currentStr) : null;

    const convo = convos.find((c: any) => c.id === conversationId);
    setConversation(convo);
    setUsers(userList);
    setCurrentUser(current);
  };

  useFocusEffect(useCallback(() => {
    loadConversation();
  }, [conversationId]));


    const getUser = (email: string) => users.find((u) => u.email === email);
    const toggle = (section: string) => setExpanded(expanded === section ? null : section);

    const attachments = conversation?.messages?.flatMap((msg: any) =>
      msg.attachment ? [{ ...msg.attachment, sender: msg.sender }] : []
    ) || [];

    const links = attachments.filter((a: { type: string; }) => a.type === 'link');
    const files = attachments.filter((a: { type: string; }) => a.type === 'file');
    const otherUser = conversation?.participants?.find((e: string) => e !== currentUser?.email);
    const otherUserInfo = getUser(otherUser);

    const avatarSrc =
      conversation?.type === 'group'
        ? conversation.groupAvatar
          ? { uri: conversation.groupAvatar }
          : defaultAvatar
        : otherUserInfo?.avatar
          ? { uri: otherUserInfo.avatar }
          : defaultAvatar;

    const displayName =
      conversation?.type === 'group'
        ? conversation?.name || 'Group Chat'
        : otherUserInfo?.fullName || otherUser || 'Direct Chat';

    const nonMembers = users.filter((u) => !conversation?.participants?.includes(u.email));

    const addMember = async (email: string) => {
      const updated = {
        ...conversation,
        participants: [...conversation.participants, email],
      };
      const convosStr = await AsyncStorage.getItem('conversations');
      const convos = convosStr ? JSON.parse(convosStr) : [];
      const updatedConvos = convos.map((c: any) => c.id === conversationId ? updated : c);
      await AsyncStorage.setItem('conversations', JSON.stringify(updatedConvos));
      setConversation(updated);
      await loadConversation();
      setKickMode(false);
      setShowAddMember(false);
    };

    const deleteChat = async () => {
      const convosStr = await AsyncStorage.getItem('conversations');
      const convos = convosStr ? JSON.parse(convosStr) : [];
      const filtered = convos.filter((c: any) => c.id !== conversationId);
      await AsyncStorage.setItem('conversations', JSON.stringify(filtered));
      navigation.goBack();
    };

    return (
      <AppLayout>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back to Conversation</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Chat Details</Text>
          </View>

          {/* Avatar and Actions */}
          <View style={styles.header}>
            <Image source={avatarSrc} style={styles.avatar} />
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => setShowSearch(true)}>
                <Feather name="search" size={20} style={styles.icon} />
              </TouchableOpacity>
              {conversation?.type === 'group' && (
                <TouchableOpacity onPress={() => setShowAddMember(true)}>
                  <Feather name="user-plus" size={20} style={styles.icon} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowAction(true)}>
                <Feather name="more-vertical" size={20} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Accordion */}
          {[
            { key: 'members', icon: 'users', label: 'Members' },
            { key: 'files', icon: 'paperclip', label: 'Files' },
            { key: 'links', icon: 'link', label: 'Links' },
          ].map((item) => (
            <View key={item.key} style={styles.section}>
              <TouchableOpacity onPress={() => toggle(item.key)} style={styles.sectionHeader}>
                <Feather name={item.icon as any} size={16} />
                <Text style={styles.sectionTitle}>{item.label}</Text>
              </TouchableOpacity>

              {item.key === 'members' && expanded === 'members' &&
                conversation?.participants?.map((email: string) => {
                  const user = getUser(email);
                  return (
                    <View key={email} style={styles.itemRow}>
                      <Image source={user?.avatar ? { uri: user.avatar } : defaultAvatar} style={styles.memberAvatar} />
                      <Text>{user?.fullName || email} {email === currentUser?.email ? '(you)' : ''}</Text>
                    </View>
                  );
                })}

              {item.key === 'files' && expanded === 'files' &&
                files.map((f: { url: string; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; size: number; }, i: React.Key | null | undefined) => (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(f.url)} style={styles.itemRow}>
                    <Text>📎 {f.name} ({(f.size / 1024).toFixed(1)} KB)</Text>
                  </TouchableOpacity>
                ))}

              {item.key === 'links' && expanded === 'links' &&
                links.map((l: { url: string; name: any; }, i: React.Key | null | undefined) => (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(l.url)} style={styles.itemRow}>
                    <Text>🔗 {l.name || l.url}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          ))}
        </ScrollView>

        {/* Modal: Search */}
        <Modal visible={showSearch} transparent animationType="fade">
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Search Messages</Text>
            <TextInput
              placeholder="Search..."
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal: Add Member */}
        <Modal visible={showAddMember} transparent animationType="fade">
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Member</Text>
            {nonMembers.map((u) => (
              <TouchableOpacity key={u.email} onPress={() => addMember(u.email)} style={styles.itemRow}>
                <Image source={u.avatar ? { uri: u.avatar } : defaultAvatar} style={styles.memberAvatar} />
                <Text>{u.fullName || u.email}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowAddMember(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal: Actions */}
        <Modal visible={showAction} transparent animationType="fade">
    <View style={styles.modal}>
      <Text style={styles.modalTitle}>Actions</Text>

      {!kickMode ? (
        <>
          <TouchableOpacity onPress={() => setKickMode(true)}>
            <Text style={{ color: 'red' }}>🚫 Kick a member</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={deleteChat}>
            <Text style={{ color: 'red', marginTop: 12 }}>🗑️ Delete chat</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowAction(false)}>
            <Text style={styles.modalClose}>Close</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.modalTitle, { marginBottom: 8 }]}>Select member to kick:</Text>

          {conversation?.participants
            ?.filter((email: string) => email !== currentUser?.email)
            .map((email:string) => {
              const user = getUser(email);
              return (
                <TouchableOpacity
                  key={email}
                  onPress={async () => {
                    const updated = {
                      ...conversation,
                      participants: conversation.participants.filter((e: string) => e !== email),
                    };
                    const convosStr = await AsyncStorage.getItem('conversations');
                    const convos = convosStr ? JSON.parse(convosStr) : [];
                    const updatedConvos = convos.map((c: any) => c.id === conversationId ? updated : c);
                    await AsyncStorage.setItem('conversations', JSON.stringify(updatedConvos));
                    setConversation(updated);
                    setKickMode(false);
                    setShowAction(false);
                  }}
                  style={styles.itemRow}
                >
                  <Image
                    source={user?.avatar ? { uri: user.avatar } : defaultAvatar}
                    style={styles.memberAvatar}
                  />
                  <Text>{user?.fullName || email}</Text>
                </TouchableOpacity>
              );
            })}

          <TouchableOpacity onPress={() => setKickMode(false)}>
            <Text style={styles.modalClose}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </Modal>
      </AppLayout>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    topRow: { flexDirection: 'column', marginBottom: 16 },
    backText: { color: '#3b82f6', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    header: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
    name: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    iconRow: { flexDirection: 'row', gap: 12 },
    icon: { color: '#1e293b' },
    section: { marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '500' },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
    memberAvatar: { width: 32, height: 32, borderRadius: 16 },
    modal: {
      backgroundColor: '#fff', margin: 32, padding: 20, borderRadius: 12,
      shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
    modalClose: { color: '#3b82f6', marginTop: 12, textAlign: 'center' },
  });
