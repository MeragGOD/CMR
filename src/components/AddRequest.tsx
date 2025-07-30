// src/components/AddRequest.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AddRequestModal: React.FC<Props> = ({ visible, onClose }) => {
  const [requestType, setRequestType] = useState<'Vacation' | 'Sick Leave' | 'Work remotely'>('Vacation');
  const [mode, setMode] = useState<'Days' | 'Hours'>('Days');
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>({});
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  const [startHour, setStartHour] = useState(new Date());
  const [endHour, setEndHour] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [vacationDaysLeft, setVacationDaysLeft] = useState(3);

  useEffect(() => {
    const fetchVacationDaysLeft = async () => {
      const userStr = await AsyncStorage.getItem('currentUser');
      const requestsStr = await AsyncStorage.getItem('requests');

      if (!userStr) return;

      const user = JSON.parse(userStr || '{}');
      const userId = user.email|| 'unknown_user';
      const defaultDays = user.vacationDaysLeft ?? 3;

      const allRequests = requestsStr ? JSON.parse(requestsStr) : {};
      const userRequests = allRequests[userId] || [];

      const usedDays = userRequests
        .filter((r: any) => r.type === 'Vacation' && r.mode === 'Days')
        .reduce((sum: number, r: any) => sum + r.dates.length, 0);

      const remaining = Math.max(defaultDays - usedDays, 0);
      setVacationDaysLeft(remaining);
    };

    if (visible) fetchVacationDaysLeft();
  }, [visible]);

  const handleDayPress = (day: { dateString: string }) => {
    if (mode === 'Hours') {
      setSelectedDate(day.dateString);
    } else {
      const selected = day.dateString;
      const dates = Object.keys(selectedDates);

      if (dates.length === 0 || dates.length >= 2) {
        setSelectedDates({
          [selected]: {
            startingDay: true,
            endingDay: true,
            color: '#00c0f0',
            textColor: '#fff',
          },
        });
      } else {
        const firstDate = dates[0];
        const start = moment.min(moment(firstDate), moment(selected)).format('YYYY-MM-DD');
        const end = moment.max(moment(firstDate), moment(selected)).format('YYYY-MM-DD');

        const range: { [key: string]: any } = {};
        let current = moment(start);
        while (current.isSameOrBefore(end)) {
          const dateStr = current.format('YYYY-MM-DD');
          range[dateStr] = {
            color: '#00c0f0',
            textColor: '#fff',
            ...(dateStr === start ? { startingDay: true } : {}),
            ...(dateStr === end ? { endingDay: true } : {}),
          };
          current = current.add(1, 'day');
        }
        setSelectedDates(range);
      }
    }
  };

  const getTotalHours = () => {
    const diffMs = endHour.getTime() - startHour.getTime();
    if (diffMs <= 0) return '0h 0m';
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${diffH}h ${diffM}m`;
  };

  const resetForm = () => {
    setRequestType('Vacation');
    setMode('Days');
    setComment('');
    setShowCommentBox(false);
    setSelectedDates({});
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setStartHour(new Date());
    setEndHour(new Date(new Date().setHours(new Date().getHours() + 1)));
  };

  const handleSubmit = async () => {
    if (mode === 'Days' && Object.keys(selectedDates).length === 0) {
      return Alert.alert('Please select at least one day.');
    }

    if (
      mode === 'Days' &&
      requestType === 'Vacation' &&
      Object.keys(selectedDates).length > vacationDaysLeft
    ) {
      return Alert.alert(`You only have ${vacationDaysLeft} vacation day(s) left.`);
    }

    if (mode === 'Hours' && startHour >= endHour) {
      return Alert.alert('Start time must be before end time.');
    }

    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      const allRequestsStr = await AsyncStorage.getItem('requests');

      const user = JSON.parse(userStr || '{}');
      const userId = user.email || 'unknown_user';

      const allRequests = allRequestsStr ? JSON.parse(allRequestsStr) : {};
      const userRequests = allRequests[userId] || [];

      const newRequest = {
        type: requestType,
        mode,
        dates: mode === 'Days' ? Object.keys(selectedDates) : [selectedDate],
        hours:
          mode === 'Hours'
            ? {
                from: startHour.toISOString(),
                to: endHour.toISOString(),
              }
            : null,
        comment,
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = {
        ...allRequests,
        [userId]: [...userRequests, newRequest],
      };

      await AsyncStorage.setItem('requests', JSON.stringify(updatedRequests));

      Alert.alert('Request sent successfully!', '', [
  {
    text: 'OK',
    onPress: () => {
      resetForm();
      onClose();
    },
  },
]);
    } catch (err) {
      console.error('Error saving request:', err);
      Alert.alert('Error saving request.');
    }
  };

  return (<Modal visible={visible} animationType="slide" transparent>
  <View style={styles.overlay}>
    <SafeAreaView style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <View style={styles.innerContainer}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
          style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>Add Request</Text>

          {/* Request Type */}
          <View style={styles.radioGroup}>
            {['Vacation', 'Sick Leave', 'Work remotely'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => setRequestType(type as any)}
              >
                <View style={styles.radioCircle}>
                  {requestType === type && <View style={styles.radioSelected} />}
                </View>
                <Text>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggle Mode */}
          <View style={styles.toggleGroup}>
            {['Days', 'Hours'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.toggleButton, mode === item && styles.toggleActive]}
                onPress={() => setMode(item as any)}
              >
                <Text style={[styles.toggleText, mode === item && styles.toggleTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calendar / Hour Mode */}
          {mode === 'Days' ? (
            <>
              <View style={styles.alertBox}>
                <Feather name="info" size={16} color="#f44336" />
                <Text style={styles.alertText}>
                  You have {vacationDaysLeft} days of Vacation left
                </Text>
              </View>
              <Calendar
                markingType="period"
                markedDates={selectedDates}
                onDayPress={handleDayPress}
                theme={{
                  selectedDayBackgroundColor: '#00c0f0',
                  todayTextColor: '#00c0f0',
                  arrowColor: '#388eff',
                }}
              />
              <Text style={{ marginTop: 8, fontWeight: '500' }}>
                You selected {Object.keys(selectedDates).length} day(s)
              </Text>
            </>
          ) : (
            <>
              <Calendar
                current={selectedDate}
                onDayPress={handleDayPress}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: '#00c0f0' },
                }}
                theme={{
                  selectedDayBackgroundColor: '#00c0f0',
                  todayTextColor: '#00c0f0',
                  arrowColor: '#388eff',
                }}
              />

              <Text style={styles.label}>From</Text>
              <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timeBox}>
                <Text>{moment(startHour).format('h:mm A')}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  value={startHour}
                  onChange={(_, date) => {
                    setShowStartPicker(false);
                    if (date) setStartHour(date);
                  }}
                />
              )}

              <Text style={styles.label}>To</Text>
              <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timeBox}>
                <Text>{moment(endHour).format('h:mm A')}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  value={endHour}
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) setEndHour(date);
                  }}
                />
              )}

              <View style={styles.totalTimeBox}>
                <Text style={styles.totalTimeText}>
                  Time for {requestType}: {getTotalHours()}
                </Text>
              </View>
            </>
          )}

          {/* Comment */}
          {!showCommentBox ? (
            <TouchableOpacity onPress={() => setShowCommentBox(true)} style={{ marginTop: 20 }}>
              <Text style={{ color: '#388eff' }}>+ Add Comment</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 20 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#388eff',
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                multiline
                placeholder="Add your comment"
                value={comment}
                onChangeText={setComment}
              />
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Send Request</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  </View>
</Modal>
  );
};

const styles = StyleSheet.create({
overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
},

innerContainer: {
  width: '95%',
  maxWidth: 480,
  alignSelf: 'center',
  backgroundColor: '#fff',
  borderRadius: 28,
  paddingHorizontal: 24,
  paddingVertical: 24,
  maxHeight: '94%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 8,
},



  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#388eff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#388eff',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#e9eef7',
    borderRadius: 25,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#388eff',
  },
  toggleText: {
    fontWeight: '500',
    color: '#888',
  },
  toggleTextActive: {
    color: '#fff',
  },
  label: {
    marginTop: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  totalTimeBox: {
    backgroundColor: '#f0f8ff',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  totalTimeText: {
    color: '#00c0f0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbe9e7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  alertText: {
    color: '#d84315',
    marginLeft: 8,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#388eff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddRequestModal;
