import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Task } from './Task';

interface Props {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
  allUsers: any[];
  onApply: (filtered: Task[]) => void;
}

export default function TaskFilterModal({ visible, onClose, tasks, allUsers, onApply }: Props) {
  const [period, setPeriod] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [taskGroups, setTaskGroups] = useState<string[]>([]);
  const [selectedReporters, setSelectedReporters] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const [estimateDay, setEstimateDay] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low' | ''>('');

  const [matchedCount, setMatchedCount] = useState(0);

  const toggleArrayItem = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];

  const handleSave = () => {
    const result = tasks.filter(task => {
      const matchPeriod = !period || new Date(task.deadline).toDateString() === period.toDateString();
      const matchGroup = taskGroups.length === 0 || taskGroups.includes(task.taskGroup || '');
      const matchReporter = selectedReporters.length === 0 || selectedReporters.includes(task.createdBy || '');
      const matchAssignee = selectedAssignees.length === 0 || selectedAssignees.includes(task.assignee);
      const matchEstimate = !estimateDay || (task.estimate && task.estimate === estimateDay);
      const matchPriority = !priority || task.priority === priority;
      return matchPeriod && matchGroup && matchReporter && matchAssignee && matchEstimate && matchPriority;
    });

    onApply(result);
    onClose();
  };

  const handleClear = () => {
    setPeriod(null);
    setTaskGroups([]);
    setSelectedReporters([]);
    setSelectedAssignees([]);
    setAssigneeSearch('');
    setEstimateDay('');
    setPriority('');
    setMatchedCount(tasks.length);
  };

  useEffect(() => {
    const result = tasks.filter(task => {
      const matchPeriod = !period || new Date(task.deadline).toDateString() === period.toDateString();
      const matchGroup = taskGroups.length === 0 || taskGroups.includes(task.taskGroup || '');
      const matchReporter = selectedReporters.length === 0 || selectedReporters.includes(task.createdBy || '');
      const matchAssignee = selectedAssignees.length === 0 || selectedAssignees.includes(task.assignee);
      const matchEstimate = !estimateDay || (task.estimate && task.estimate === estimateDay);
      const matchPriority = !priority || task.priority === priority;
      return matchPeriod && matchGroup && matchReporter && matchAssignee && matchEstimate && matchPriority;
    });

    setMatchedCount(result.length);
  }, [period, taskGroups, selectedReporters, selectedAssignees, estimateDay, priority]);

  const filteredAssignees = allUsers.filter(user =>
    user.fullName?.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Filters</Text>

        {/* Period */}
        <Text style={styles.label}>Period</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputBox}>
          <Text>{period ? period.toDateString() : 'Select Period'}</Text>
          <Feather name="calendar" size={16} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={period || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowDatePicker(false);
              if (date) setPeriod(date);
            }}
          />
        )}

        {/* Task Group */}
        <Text style={styles.label}>Task Group</Text>
        {['Design', 'Development', 'Testing', 'Marketing', 'Project Management'].map(group => (
          <TouchableOpacity
            key={group}
            onPress={() => setTaskGroups(toggleArrayItem(taskGroups, group))}
            style={styles.checkboxRow}
          >
            <Text style={styles.name}>{group}</Text>
            {taskGroups.includes(group) && <Feather name="check" size={16} color="#1A73E8" />}
          </TouchableOpacity>
        ))}

        {/* Reporter */}
        <Text style={styles.label}>Reporter</Text>
        {allUsers.map(user => (
          <TouchableOpacity
            key={user.email}
            style={styles.checkboxRow}
            onPress={() => setSelectedReporters(toggleArrayItem(selectedReporters, user.email))}
          >
            <Image source={user.avatar ? { uri: user.avatar } : require('../../assets/profile.png')} style={styles.avatar} />
            <Text style={styles.name}>{user.fullName || user.email}</Text>
            {selectedReporters.includes(user.email) && <Feather name="check" size={16} color="#1A73E8" />}
          </TouchableOpacity>
        ))}

        {/* Assignees with search */}
        <Text style={styles.label}>Assignees</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={assigneeSearch}
          onChangeText={setAssigneeSearch}
        />
        {filteredAssignees.map(user => (
          <TouchableOpacity
            key={user.email}
            style={styles.checkboxRow}
            onPress={() => setSelectedAssignees(toggleArrayItem(selectedAssignees, user.email))}
          >
            <Image source={user.avatar ? { uri: user.avatar } : require('../../assets/profile.png')} style={styles.avatar} />
            <Text style={styles.name}>{user.fullName || user.email}</Text>
            {selectedAssignees.includes(user.email) && <Feather name="check" size={16} color="#1A73E8" />}
          </TouchableOpacity>
        ))}

        {/* Estimate */}
        <Text style={styles.label}>Estimate (day)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter exact estimate"
          keyboardType="numeric"
          value={estimateDay}
          onChangeText={setEstimateDay}
        />

        {/* Priority dropdown */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={priority} onValueChange={(val) => setPriority(val)}>
            <Picker.Item label="Select priority" value="" />
            <Picker.Item label="High" value="High" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="Low" value="Low" />
          </Picker>
        </View>

        {/* Matches + buttons */}
        <Text style={styles.matchText}>{matchedCount} matches found</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearText}>Clear Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
          <Text style={{ color: '#1A73E8', textAlign: 'center' }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 20, fontWeight: '600', color: '#666' },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 6,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f0f0f5',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  name: { flex: 1 },
  matchText: { marginTop: 30, color: '#666' },
  saveButton: { backgroundColor: '#1A73E8', padding: 14, borderRadius: 8, marginTop: 10 },
  saveButtonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  clearButton: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginTop: 10 },
  clearText: { textAlign: 'center', color: '#1A73E8' },
});
