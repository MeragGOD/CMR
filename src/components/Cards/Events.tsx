import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

type Event = {
  id?: string;
  name: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  time: string;
};

interface Props {
  event: Event;
  onPress?: () => void;
}

const categoryColor: Record<string, string> = {
  Birthday: '#a855f7',
  'Team Meeting': '#3b82f6',
  'Corporate Event': '#ec4899',
};



const priorityIcon: Record<Event['priority'], { icon: string; color: string }> = {
  High: { icon: 'arrow-up', color: '#ef4444' },
  Medium: { icon: 'arrow-up-right', color: '#f59e0b' },
  Low: { icon: 'arrow-down-right', color: '#10b981' },
};

export default function EventCard({ event, onPress }: Props) {
  const bgColor = categoryColor[event.category] || '#ccc';
  const { icon, color } = priorityIcon[event.priority] || priorityIcon.Medium;

  const getTimeRemaining = () => {
  const eventTime = new Date(event.time);
  const now = new Date();
  const diff = eventTime.getTime() - now.getTime();

  if (isNaN(eventTime.getTime()) || diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const weekday = eventTime.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue", etc.

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);

  return `${weekday} • ${parts.join(' ')} left`;  // <== kết quả ví dụ: "Tue • 1d 2h 30m left"
};

  
  const getFormattedDate = () => {
    const date = new Date(event.time);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress}>
      <View style={[styles.colorBar, { backgroundColor: bgColor }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.date}>{getFormattedDate()}</Text>
          <View style={styles.priorityBox}>
            <Feather name={icon as any} size={16} color={color} />
            <Text style={[styles.priorityText, { color }]}>{event.priority}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Feather name="clock" size={14} color="#6b7280" style={styles.iconSpacing} />
          <Text style={styles.time}>{getTimeRemaining()}</Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
  width: screenWidth * 0.85, // hoặc 85% nếu dùng Dimensions.get('window').width * 0.85
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 14,
  marginBottom: 6,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 6,
  elevation: 2,
},
date: {
  fontSize: 13,
  color: '#6b7280',
  marginBottom: 4,
},
  colorBar: {
    width: 6,
    height: '100%',
    borderRadius: 6,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    color: '#111827',
  },
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 6,
  },
  time: {
    fontSize: 13,
    color: '#6b7280',
  },
});
