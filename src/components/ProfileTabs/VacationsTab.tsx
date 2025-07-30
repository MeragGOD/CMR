import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Feather } from '@expo/vector-icons';

interface Request {
  type: 'Vacation' | 'Sick Leave' | 'Work remotely';
  dates: string[];
  hours?: { from: string; to: string };
  createdAt: string;
  mode: 'Days' | 'Hours';
}

const COLORS: Record<Request['type'], string> = {
  'Sick Leave': '#ff4d4f',
  'Work remotely': '#8e44ad',
  Vacation: '#00c0f0',
};

const VacationsTab = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      const reqStr = await AsyncStorage.getItem('requests');

      if (!userStr || !reqStr) return;

      const user = JSON.parse(userStr);
      const allRequests = JSON.parse(reqStr);
      const userRequests: Request[] = allRequests[user.email] || [];

      // Sort by createdAt descending
      userRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRequests(userRequests);
    };

    fetchData();
  }, []);

  const formatDateRange = (dates: string[]) => {
    if (dates.length === 1) {
      return moment(dates[0]).format('MMM D, YYYY');
    }
    const start = moment(dates[0]);
    const end = moment(dates[dates.length - 1]);
    return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
  };

  const getHourDuration = (from: string, to: string) => {
    const start = moment(from);
    const end = moment(to);
    const duration = moment.duration(end.diff(start));
    const hours = duration.asHours();
    return `${hours.toFixed(1)}h`;
  };

  return (
    <>
      {requests.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Request Type</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#00c853' }]}>
              <Text style={styles.statusText}>Approved</Text>
            </View>
          </View>

          <View style={[styles.row, { marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: COLORS[item.type] }]} />
              <Text style={styles.type}>{item.type}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Feather name="calendar" size={14} color="#888" style={{ marginRight: 4 }} />
            <Text style={styles.meta}>
              {formatDateRange(item.dates)} •{' '}
              {item.mode === 'Days'
                ? `${item.dates.length}d`
                : item.hours
                  ? getHourDuration(item.hours.from, item.hours.to)
                  : '—'}
            </Text>
          </View>
        </View>
      ))}

      {requests.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
          No vacation requests yet.
        </Text>
      )}
    </>
  );
};

export default VacationsTab;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  meta: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
    flex: 1,
  },
});
