import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import EventCard from '../../components/Cards/Events';
import AppLayout from '../../components/AppLayout';


export default function AllEventsScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchEvents = async () => {
        const userStr = await AsyncStorage.getItem('currentUser');
        const allEventsStr = await AsyncStorage.getItem('events');
        if (!userStr || !allEventsStr) return;

        const user = JSON.parse(userStr);
        const allEvents = JSON.parse(allEventsStr);
        const allowedEmails = [user.email];
        if (user.role === 'Assignee' && user.leaderEmail) {
          allowedEmails.push(user.leaderEmail);
        }

        const userEvents = allEvents.filter((e: any) =>
          allowedEmails.includes(e.createdBy)
        );


        // Sort by date+time
        const now = Date.now();
        const sorted = userEvents
          .filter((e: any) => {
            const eventTime = new Date(`${e.date} ${e.time}`).getTime();
            return !isNaN(eventTime) && eventTime >= now; // loại bỏ sự kiện đã qua
          })
          .sort((a: any, b: any) => {
            const aRemaining = new Date(`${a.date} ${a.time}`).getTime() - now;
            const bRemaining = new Date(`${b.date} ${b.time}`).getTime() - now;
            return aRemaining - bRemaining;
          });


        setEvents(sorted);
      };

      fetchEvents();
    }, [])
  );

  return (
    <AppLayout><View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Feather name="arrow-left" size={16} color="#1A73E8" />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>
      <Text style={styles.pageTitle}>Nearest Events</Text>
    </View>


      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </View></AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
  marginBottom: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    color: '#1A73E8',
    marginLeft: 6,
    fontWeight: '500',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

});
