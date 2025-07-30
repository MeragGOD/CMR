import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import NotificationModal from './Notification';
import { Notification } from './Notification';

const defaultAvatar = require('../assets/profile.png');

export default function SearchBar({ onMenuPress }: { onMenuPress?: () => void }) {
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;


  const fetchData = async () => {
    const data = await AsyncStorage.getItem('currentUser');
    const notiStr = await AsyncStorage.getItem('notifications');
    const user = data ? JSON.parse(data) : null;
    const allNoti: Notification[] = notiStr ? JSON.parse(notiStr) : [];

    setCurrentUser(user);
    setAvatar(user?.avatar || null);

    const related = allNoti.filter(
      n =>
        n.receiver === user?.email ||
        n.meta?.assignee === user?.email ||
        n.meta?.reporter === user?.email
    );

    setNotifications(related.reverse());
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <View style={{ backgroundColor: '#eef4ff' }}>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Feather name="menu" size={22} color="#333" />
        </TouchableOpacity>

        <View style={styles.searchInput}>
          <Text style={{ color: '#aaa' }}>Search...</Text>
        </View>

        <Feather name="search" size={20} color="#333" />
        <View style={{ position: 'relative', marginLeft: 16 }}>
       <TouchableOpacity onPress={() => setShowNotification(true)}>
          <Feather name="bell" size={20} color="#333" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity></View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
          <Image source={avatar ? { uri: avatar } : defaultAvatar} style={styles.avatar1} />
        </TouchableOpacity>
      </View>

      {/* Modal hiển thị thông báo */}
      <NotificationModal
        visible={showNotification}
        onClose={() => setShowNotification(false)}
        notifications={notifications}
        setNotifications={setNotifications} // 👈 truyền thêm
      />
    </View>
  );
}
