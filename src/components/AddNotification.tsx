// src/utils/addNotification.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const addNotification = async (noti: {
  type: 'comment' | 'status' | 'assignment';
  message: string;
  taskName?: string;
  actorName?: string;
  actorAvatar?: string;
  receiver?: string;
  meta?: {
    assignee?: string;
    reporter?: string;
  };
}) => {
  const newNoti = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...noti,
  };

  const prevStr = await AsyncStorage.getItem('notifications');
  const prev = prevStr ? JSON.parse(prevStr) : [];
  await AsyncStorage.setItem('notifications', JSON.stringify([...prev, newNoti]));
};
