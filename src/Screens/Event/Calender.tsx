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
    const grouped = groupEventsByDate(allEvents);
    setEventsForDate(grouped[selectedDate] || []);
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
  const result: Record<string, any[]> = {};

  const today = new Date();
  const rangeDays = 60; // duyệt trong 60 ngày tới

  for (let i = -30; i <= rangeDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    events.forEach(event => {
      const baseDateStr = new Date(event.date).toISOString().split('T')[0];
      const baseDate = new Date(baseDateStr);

      if (event.repeat && event.repeatOptions) {
        const { frequency, days, everyDay } = event.repeatOptions;

        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        const sameTime = event.time;

        let shouldInclude = false;

        if (frequency === 'Daily' && everyDay) {
          shouldInclude = true;
        } else if (frequency === 'Weekly' && days?.includes(dayOfWeek)) {
          shouldInclude = true;
        } else if (frequency === 'Monthly' && baseDate.getDate() === date.getDate()) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          if (!result[dateStr]) result[dateStr] = [];
          result[dateStr].push({ ...event, date: dateStr, time: sameTime });
        }
      } else {
        // sự kiện không lặp
        if (baseDateStr === dateStr) {
          if (!result[dateStr]) result[dateStr] = [];
          result[dateStr].push(event);
        }
      }
    });
  }

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

  if (isNaN(eventTime) || diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);

  return `${parts.join(' ')} left`;
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
