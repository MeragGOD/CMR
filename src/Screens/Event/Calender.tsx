//src/Screens/Event/Calender.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from '../../components/AppLayout';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [eventsForDate, setEventsForDate] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadEvents();
    
  }, [isFocused]);

  useEffect(() => {
    const filtered = allEvents.filter(e =>
      new Date(e.date).toISOString().split('T')[0] === selectedDate
    );
    setEventsForDate(filtered);

    const grouped = groupEventsByDate(allEvents);
    const marked = buildMarkedDates(grouped);
    setMarkedDates(marked);
  }, [selectedDate, allEvents]);

      const loadEvents = async () => {
      const user = await AsyncStorage.getItem('currentUser');
      const currentUser = user ? JSON.parse(user) : null;

      if (!currentUser) return;

      const stored = await AsyncStorage.getItem('events');
      const parsed = stored ? JSON.parse(stored) : [];

      // Tập hợp email cần lấy sự kiện
      const allowedEmails = [currentUser.email];
      if (currentUser.role === 'Assignee' && currentUser.leaderEmail) {
        allowedEmails.push(currentUser.leaderEmail);
      }

      // Lọc tất cả event theo những người này tạo
      const events = parsed.filter((e: any) => allowedEmails.includes(e.createdBy));

      setAllEvents(events);
    };



  const groupEventsByDate = (events: any[]) => {
    const result: any = {};
    events.forEach(event => {
      const date = new Date(event.date).toISOString().split('T')[0];
      if (!result[date]) result[date] = [];
      result[date].push(event);
    });
    return result;
  };

  const buildMarkedDates = (eventsByDate: any) => {
    const marked: any = {};
    const categoryColor: Record<string, string> = {
      Birthday: '#a855f7',
      'Team Meeting': '#3b82f6',
      'Corporate Event': '#ec4899',
    };

    Object.entries(eventsByDate).forEach(([date, events]: [string, any]) => {
      const dots: any[] = [];
      const seen: Record<string, boolean> = {};

      events.forEach((e: any) => {
        const color = categoryColor[e.category] || '#ccc';
        if (!seen[e.category]) {
          dots.push({ key: e.category, color });
          seen[e.category] = true;
        }
      });

      marked[date] = {
        marked: true,
        dots,
        ...(date === selectedDate ? { selected: true, selectedColor: '#1e88e5' } : {}),
      };
    });

    // nếu ngày được chọn chưa có sự kiện vẫn highlight
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#1e88e5',
      };
    }

    return marked;
  };

  const categoryColor: Record<string, string> = {
  Birthday: '#a855f7',        // tím
  'Team Meeting': '#3b82f6',  // xanh
  'Corporate Event': '#ec4899'// hồng
};
const getTimeRemaining = (event: any) => {
  
  if (!event.time) return '';
  const eventTime = new Date(event.time).getTime();
  const now = Date.now();
  const diff = eventTime - now;

  if (diff <= 0) return 'Started';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${mins}m left`;
};


  return (
    <AppLayout>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <Text style={styles.header}>Calendar</Text>

        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            todayTextColor: '#1e88e5',
          }}
        />

        <Text style={styles.sectionTitle}>
          {new Date(selectedDate).toDateString()}
        </Text>

        <ScrollView style={{ marginTop: 10 }}>
          {eventsForDate.map((event, idx) => {
          const bgColor = categoryColor[event.category] || '#ccc';
          const remaining = getTimeRemaining(event);

          return (
            <View key={idx} style={styles.eventCard}>
              <View style={[styles.eventColorBar, { backgroundColor: bgColor }]} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <View style={styles.row}>
                  <Feather name="clock" size={16} color={bgColor} style={{ marginRight: 6 }} />
                  <Text style={styles.eventTime}>{remaining}</Text>
                </View>
              </View>
            </View>
          );
        })}


          {eventsForDate.length === 0 && (
            <Text style={{ marginTop: 20, color: '#999', textAlign: 'center' }}>
              No events for this day.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppLayout>
  );
}

function getToday() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  eventColorBar: {
    width: 4,
    height: '100%',
    borderRadius: 10,
    marginRight: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f6f9fc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  sideLine: {
    width: 4,
    height: '100%',
    borderRadius: 10,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 13,
    color: '#444',
  },
  
});
