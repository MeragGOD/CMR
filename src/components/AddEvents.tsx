import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput, Switch,
  ScrollView, StyleSheet, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';

const categories = ['Corporate Event', 'Team Meeting', 'Birthday'];
const priorities = ['Low', 'Medium', 'High'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AddEventModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState(priorities[1]);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [repeatEveryDay, setRepeatEveryDay] = useState(false);
  const [repeatTime, setRepeatTime] = useState<Date | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatTimePicker, setShowRepeatTimePicker] = useState(false);


  useEffect(() => {
    (async () => {
      const user = await AsyncStorage.getItem('currentUser');
      if (user) setCurrentUserEmail(JSON.parse(user).email);
    })();
  }, []);

  const toggleDay = (d: string) => {
    setRepeatDays(prev =>
      prev.includes(d) ? prev.filter(day => day !== d) : [...prev, d]
    );
  };
  const resetForm = () => {
    setEventName('');
    setCategory('Corporate Event');
    setPriority('Medium');
    setDate(null);
    setTime(null);
    setDescription('');
    setRepeat(false);
    setFrequency('Daily');
    setRepeatDays([]);
    setRepeatEveryDay(false);
    };

  const saveEvent = async () => {
  if (!eventName || !date || !time) {
    alert('Please enter Event Name, Date and Time');
    return;
  }

  // 🔧 Gộp date + time thành 1 Date object hoàn chỉnh
  const eventDateTime = new Date(
    date.getFullYear(), date.getMonth(), date.getDate(),
    time.getHours(), time.getMinutes()
  );

  const newEvent = {
    id: Date.now().toString(),
    name: eventName,
    category,
    priority,
    date: date.toISOString().split('T')[0], // để Calendar lọc
    time: eventDateTime.toISOString(),      // để Dashboard so sánh đúng
    description,
    repeat,
    repeatOptions: repeat
      ? {
          frequency,
          days: repeatDays,
          everyDay: repeatEveryDay,
          time: repeatTime ? repeatTime.toISOString() : null,
        }
      : null,
    createdBy: currentUserEmail,
  };

  console.log('Event saved:', newEvent);

  const stored = await AsyncStorage.getItem('events');
  const events = stored ? JSON.parse(stored) : [];
  await AsyncStorage.setItem('events', JSON.stringify([...events, newEvent]));
  resetForm();
  onClose();
};


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.title}>Add Event</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Event Name</Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder="Katy's Birthday"
            />

            <Text style={styles.label}>Event Category</Text>
            <View style={styles.picker}>
              <Picker selectedValue={category} onValueChange={setCategory}>
                {categories.map(c => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.picker}>
              <Picker selectedValue={priority} onValueChange={setPriority}>
                {priorities.map(p => <Picker.Item key={p} label={p} value={p} />)}
              </Picker>
            </View>

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Feather name="calendar" size={18} />
              <Text style={{ marginLeft: 10 }}>
                {date ? date.toDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Time</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
              <Feather name="clock" size={18} />
              <Text style={{ marginLeft: 10 }}>
                {time ? time.toLocaleTimeString() : 'Select Time'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time || new Date()}
                mode="time"
                is24Hour
                display="default"
                onChange={(_, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Add description"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Repeat Event</Text>
              <Switch value={repeat} onValueChange={setRepeat} />
            </View>

            {repeat && (
              <>
                <Text style={styles.label}>Complete this task</Text>
                <View style={styles.row}>
                  {['Daily', 'Weekly', 'Monthly'].map(f => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                      onPress={() => setFrequency(f as any)}
                    >
                      <Text style={frequency === f ? styles.freqTextActive : styles.freqText}>
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>On these days</Text>
                <View style={styles.dayRow}>
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayBtn, repeatDays.includes(day) && styles.dayBtnActive]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text style={repeatDays.includes(day) ? styles.dayTextActive : styles.dayText}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.label}>Repeat every day</Text>
                  <Switch value={repeatEveryDay} onValueChange={setRepeatEveryDay} />
                </View>

                <Text style={styles.label}>Time</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowRepeatTimePicker(true)}>
                  <Feather name="clock" size={18} />
                  <Text style={{ marginLeft: 10 }}>
                    {repeatTime ? repeatTime.toLocaleTimeString() : 'Select Time'}
                  </Text>
                </TouchableOpacity>
                {showRepeatTimePicker && (
                  <DateTimePicker
                    value={repeatTime || new Date()}
                    mode="time"
                    is24Hour
                    display="default"
                    onChange={(_, selectedTime) => {
                      setShowRepeatTimePicker(false);
                      if (selectedTime) setRepeatTime(selectedTime);
                    }}
                  />
                )}
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={saveEvent}>
              <Text style={styles.saveText}>Save Event</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddEventModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000030',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '95%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 10,
    padding: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#dfe4ea',
    borderRadius: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  freqBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  freqBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  freqText: {
    color: '#333',
  },
  freqTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  dayBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dayBtnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayText: {
    color: '#000',
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
