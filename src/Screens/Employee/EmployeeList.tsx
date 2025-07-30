import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

type Level = 'Intern' | 'Junior' | 'Middle' | 'Senior';

const LEVELS: Level[] = ['Intern', 'Junior', 'Middle', 'Senior'];

const getAge = (birthday: string) => {
  if (!birthday) return '-';

  let birthDate: Date;
  if (birthday.includes('/')) {
    const parts = birthday.split('/');
    if (parts.length !== 3) return '-';
    const [month, day, year] = parts;
    birthDate = new Date(
      `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    );
  } else {
    birthDate = new Date(birthday);
  }

  const today = new Date();
  if (isNaN(birthDate.getTime()) || birthDate > today) return '-';

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  return age.toString();
};

const EmployeeList = ({
  employees,
  currentUser,
}: {
  employees: any[];
  currentUser: any;
}) => {
  // Local state để UI cập nhật ngay sau khi chỉnh sửa
  const [list, setList] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Đồng bộ props -> state hiển thị, đảm bảo currentUser lên đầu
  useEffect(() => {
    const filteredEmployees = employees.filter(
      (emp) => emp.email !== currentUser?.email
    );
    const displayList = currentUser
      ? [currentUser, ...filteredEmployees]
      : employees;
    setList(displayList);
  }, [employees, currentUser]);

  const membersKey = useMemo(() => {
    return currentUser?.email ? `members_${currentUser.email}` : null;
  }, [currentUser?.email]);

  const openActions = (emp: any) => {
    setSelectedEmployee(emp);
    setActionModalVisible(true);
  };

  const closeActions = () => {
    setSelectedEmployee(null);
    setActionModalVisible(false);
  };

  const updateLevel = async (email: string, newLevel: Level) => {
    try {
      if (!membersKey) return;

      const raw = await AsyncStorage.getItem(membersKey);
      const members = raw ? JSON.parse(raw) : [];

      // Cập nhật level trong storage
      const updatedMembers = members.map((m: any) =>
        m?.email === email ? { ...m, level: newLevel } : m
      );
      await AsyncStorage.setItem(membersKey, JSON.stringify(updatedMembers));

      // Cập nhật ngay UI
      setList((prev) =>
        prev.map((emp) =>
          emp.email === email ? { ...emp, level: newLevel } : emp
        )
      );

      closeActions();
    } catch (e) {
      console.warn('updateLevel error:', e);
    }
  };

  const confirmKick = (email: string) => {
    Alert.alert(
      'Kick Employee',
      'Bạn có chắc chắn muốn loại nhân viên này khỏi team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Kick', style: 'destructive', onPress: () => kickEmployee(email) },
      ]
    );
  };

  const kickEmployee = async (email: string) => {
    try {
      if (!membersKey) return;

      const raw = await AsyncStorage.getItem(membersKey);
      const members = raw ? JSON.parse(raw) : [];

      const updatedMembers = members.filter((m: any) => m?.email !== email);
      await AsyncStorage.setItem(membersKey, JSON.stringify(updatedMembers));

      // Cập nhật ngay UI (giữ currentUser ở đầu nếu có)
      setList((prev) => prev.filter((emp) => emp.email !== email));

      closeActions();
    } catch (e) {
      console.warn('kickEmployee error:', e);
    }
  };

  const renderEmployeeCard = ({ item }: { item: any }) => {
    const isSelf = item.email === currentUser?.email;

    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Image
              source={
                item.avatar
                  ? { uri: item.avatar }
                  : require('../../assets/profile.png')
              }
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{item.fullName || 'Unnamed'}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => openActions(item)}>
            <Feather name="more-vertical" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.tripleRow}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{item.gender || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Birthday</Text>
            <Text style={styles.value}>{item.birthday || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{getAge(item.birthday || '')}</Text>
          </View>
        </View>

        <View style={styles.positionRow}>
          <Text style={styles.label}>Position</Text>
          <View style={styles.positionContent}>
            <Text style={styles.value}>{item.youAre || '-'}</Text>
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>{item.level || 'Intern'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      {list.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#999' }}>
          No employees found.
        </Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.email}
          renderItem={renderEmployeeCard}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Action Modal */}
      <Modal visible={actionModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeActions}>
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              Actions {selectedEmployee ? `for ${selectedEmployee.fullName || selectedEmployee.email}` : ''}
            </Text>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Set Level</Text>
            </View>

            {LEVELS.map((lv) => {
              const active = selectedEmployee?.level === lv;
              return (
                <TouchableOpacity
                  key={lv}
                  style={[styles.modalOption, active && styles.modalOptionActive]}
                  onPress={() => updateLevel(selectedEmployee?.email, lv)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      active && styles.modalOptionTextActive,
                    ]}
                  >
                    {lv}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Divider */}
            <View style={styles.modalDivider} />

            {/* Kick (ẩn nếu là chính mình) */}
            {selectedEmployee?.email !== currentUser?.email && (
              <TouchableOpacity
                style={[styles.modalOption, styles.kickOption]}
                onPress={() => confirmKick(selectedEmployee?.email)}
              >
                <Text style={styles.kickText}>Kick Employee</Text>
              </TouchableOpacity>
            )}

            <Pressable onPress={closeActions}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default EmployeeList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#aaa',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  tripleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    color: '#999',
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: '#333',
    fontWeight: '500',
    fontSize: 13,
  },
  positionRow: {
    flexDirection: 'column',
  },
  positionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelTag: {
    backgroundColor: '#eef3ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  levelText: {
    fontSize: 12,
    color: '#1e88e5',
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionActive: {
    backgroundColor: '#eef3ff',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
  },
  modalOptionTextActive: {
    fontWeight: '700',
    color: '#1e88e5',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  kickOption: {
    backgroundColor: '#fee2e2',
  },
  kickText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
});
