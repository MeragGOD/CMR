import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../../components/AppLayout';
import CreateMessageModal from '../../components/CreateMessageModal';
import type { RootStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const defaultAvatar = require('../../assets/profile.png');
const defaultGroupIcon = require('../../assets/profile.png');

type ChatItemProps = {
  name: string;
  message: string;
  time: string;
  unread: number;
  avatar: any;
  onPress: () => void;
};

export default function MessengerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showGroups, setShowGroups] = useState(true);
  const [showDirects, setShowDirects] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const current = await AsyncStorage.getItem('currentUser');
      const users = await AsyncStorage.getItem('users');
      const profiles = await AsyncStorage.getItem('userProfiles');
      const convos = await AsyncStorage.getItem('conversations');

      if (current) setUser(JSON.parse(current));
      if (users) setAllUsers(JSON.parse(users));
      if (profiles) setUserProfiles(JSON.parse(profiles));
      if (convos) setConversations(JSON.parse(convos));
    };

    fetchData();
  }, []);

  return (
    <AppLayout>
      <Text style={styles.title}>Messenger</Text>

      <View style={styles.conversationBox}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conversations</Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity>
              <Feather name="search" size={20} style={{ marginRight: 16 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.plusButton} onPress={() => setShowCreateModal(true)}>
              <Feather name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Groups */}
          <TouchableOpacity
            onPress={() => setShowGroups(!showGroups)}
            style={styles.toggleHeader}
          >
            <Feather
              name={showGroups ? 'chevron-down' : 'chevron-right'}
              size={14}
              color="#3b82f6"
            />
            <Text style={styles.subHeading}>Groups</Text>
          </TouchableOpacity>

          {showGroups &&
            conversations
              .filter((c) => c.type === 'group')
              .map((c) => {
                const avatarSource = c.groupAvatar
                  ? { uri: c.groupAvatar }
                  : defaultAvatar;

                return (
                  <ChatItem
                    key={c.id}
                    name={c.name || 'Unnamed Group'}
                    message={c.messages?.[c.messages.length - 1]?.text || 'No messages yet'}
                    time={new Date(c.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    unread={c.unreadCount || 0}
                    avatar={avatarSource}
                    onPress={() =>
                      navigation.navigate('Conversation', { conversationId: c.id })
                    }
                  />
                );
              })}


          {/* Direct Messages */}
          <TouchableOpacity
            onPress={() => setShowDirects(!showDirects)}
            style={styles.toggleHeader}
          >
            <Feather
              name={showDirects ? 'chevron-down' : 'chevron-right'}
              size={14}
              color="#3b82f6"
            />
            <Text style={styles.subHeading}>Direct Messages</Text>
          </TouchableOpacity>

                  {showDirects &&
          conversations
            .filter((c) => c.type === 'direct')
            .map((c) => {
              const otherEmail = c.participants.find((e: string) => e !== user?.email);
              const otherUser = allUsers.find((u) => u.email === otherEmail) || {};
              const avatarSource = otherUser.avatar ? { uri: otherUser.avatar } : defaultAvatar;
              const fullName = otherUser.fullName || otherEmail;

              return (
                <ChatItem
                  key={c.id}
                  name={`${fullName} (${otherEmail})`} // ✅ đồng bộ hiển thị
                  message={c.messages?.[c.messages.length - 1]?.text || 'No messages yet'}
                  time={new Date(c.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  unread={c.unreadCount || 0}
                  avatar={avatarSource}
                  onPress={() => navigation.navigate('Conversation', { conversationId: c.id })}
                />
              );
            })}

        </ScrollView>
      </View>

      <CreateMessageModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(conv) => {
          console.log('Conversation created:', conv);
          setConversations((prev) => [conv, ...prev]);
        }}
      />
    </AppLayout>
  );
}

// 🔹 Chat item
const ChatItem = ({ name, message, time, unread, avatar, onPress }: ChatItemProps) => (
  <TouchableOpacity style={styles.chatItem} onPress={onPress}>
    <Image source={avatar} style={styles.chatAvatar} />
    <View style={styles.chatContent}>
      <Text style={styles.chatName}>{name}</Text>
      <Text style={styles.chatMessage} numberOfLines={1}>
        {message}
      </Text>
    </View>
    <View style={styles.chatMeta}>
      <Text style={styles.chatTime}>{time}</Text>
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// 🔹 Style
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#eef4ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
    marginLeft: 16,
    color: '#1e293b',
  },
  conversationBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  sectionActions: { flexDirection: 'row', alignItems: 'center' },
  plusButton: {
    backgroundColor: '#3b82f6',
    padding: 6,
    borderRadius: 12,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 6,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.3,
    borderColor: '#eee',
  },
  chatAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  chatContent: { flex: 1 },
  chatName: { fontWeight: 'bold', fontSize: 14, color: '#1e293b' },
  chatMessage: { fontSize: 12, color: '#64748b', marginTop: 2 },
  chatMeta: { alignItems: 'flex-end' },
  chatTime: { fontSize: 12, color: '#94a3b8' },
  badge: {
    marginTop: 6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 12, color: '#fff' },
});
