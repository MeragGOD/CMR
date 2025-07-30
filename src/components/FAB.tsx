// src/components/FAB.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from './styles';
import AddTaskModal from '../Screens/Project/AddTask';
import AddRequestModal from './AddRequest';
import AddMemberModal from './AddMember';
import { useNavigation } from '@react-navigation/native';
import AddProjectModal from '../Screens/Project/AddProjectScreen';
import AddEventModal from './AddEvents'; // đường dẫn đúng tới file của bạn


interface ModalItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

const modalItems: ModalItem[] = [
  { icon: 'layers', label: 'Project' },
  { icon: 'file-text', label: 'Task' },
  { icon: 'calendar', label: 'Event' },
  { icon: 'send', label: 'Request' },
  { icon: 'user', label: 'Employee' },
  { icon: 'folder', label: 'Folder to Info Portal' },
];

const FloatingAddModal = () => {
  const navigation = useNavigation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);



  const handleModalItemPress = (item: ModalItem) => {
    setShowAddModal(false);
    switch (item.label) {
      case 'Task':
        setShowTaskModal(true);
        break;
      case 'Event':
        setShowEventModal(true);
        break;
      case 'Project':
        setShowProjectModal(true);
        break;
      case 'Request':
        setShowRequestModal(true);
        break;
      case 'Employee':
        setShowEmployeeModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal Overlay */}
      {showAddModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}
          activeOpacity={1}
        >
          <View style={styles.addModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle2}>Add...</Text>
            {modalItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.modalItem}
                onPress={() => handleModalItemPress(item)}
              >
                <Feather name={item.icon} size={20} color="#1e88e5" style={{ marginRight: 12 }} />
                <Text style={styles.modalItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      <AddTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
      />

      <AddRequestModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />

      <AddMemberModal
        visible={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
      />

      <AddProjectModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />
      <AddEventModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
      />

    </>
  );
};

export default FloatingAddModal;

