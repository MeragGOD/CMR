import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultAvatar = require('../assets/profile.png');

export type Notification = {
  id: string;
  type: 'comment' | 'status' | 'assignment';
  message: string;
  taskName?: string;
  actorName?: string;
  actorAvatar?: string;
  createdAt: string;
  receiver?: string;
  isRead?: boolean;
  meta?: {
    assignee?: string;
    reporter?: string;
  };
};

interface Props {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: (notis: Notification[]) => void;
}

export default function NotificationModal({
  visible,
  onClose,
  notifications,
  setNotifications,
}: Props) {
  const [settings, setSettings] = useState({
    enableComment: true,
    enableStatus: true,
    enableAssignment: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const str = await AsyncStorage.getItem('notificationSettings');
      if (str) {
        setSettings(JSON.parse(str));
      }
    };
    fetchSettings();
  }, []);

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 60000) return 'Just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderNotification = (item: Notification) => {
    const timeText = formatTime(item.createdAt);
    return (
      <View key={item.id} style={styles.notification}>
        <Image
          source={item.actorAvatar ? { uri: item.actorAvatar } : defaultAvatar}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.messageText, !item.isRead && styles.unreadText]}>
            {item.actorName && <Text style={styles.actor}>{item.actorName} </Text>}
            {item.message}
            {item.taskName && <Text style={styles.task}> {item.taskName} </Text>}
          </Text>
          <Text style={styles.timeText}>{timeText}</Text>
        </View>
      </View>
    );
  };

  // Apply settings
  const filteredNotifications = notifications.filter(n => {
    if (n.type === 'comment' && !settings.enableComment) return false;
    if (n.type === 'status' && !settings.enableStatus) return false;
    if (n.type === 'assignment' && !settings.enableAssignment) return false;
    return true;
  });

  const unread = filteredNotifications.filter((n) => !n.isRead);
  const read = filteredNotifications.filter((n) => n.isRead);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={{ color: '#2563eb', marginRight: 12 }}>Mark all as read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {unread.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Unread</Text>
                {unread.map(renderNotification)}
              </>
            )}
            {read.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Read</Text>
                {read.map(renderNotification)}
              </>
            )}
            {unread.length === 0 && read.length === 0 && (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8' }}>
                No notifications to show
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000044',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
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
    color: '#1e293b',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  actor: {
    fontWeight: '600',
  },
  task: {
    fontWeight: '600',
    color: '#0f172a',
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 6,
  },
});
