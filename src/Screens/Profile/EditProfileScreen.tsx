import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const defaultAvatar = require('../../assets/profile.png');

export default function EditProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [youAre, setYouAre] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();
  const [gender, setGender] = useState('');


  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        const data = await AsyncStorage.getItem('currentUser');
        if (data) {
          const parsed = JSON.parse(data);
          setUser(parsed);
          setFullName(parsed.fullName || '');
          setAvatar(parsed.avatar || '');
          setYouAre(parsed.youAre || '');
          setCompanyName(parsed.companyName || '');
          setLocation(parsed.location || '');
          setBirthday(parsed.birthday || '');
          setGender(parsed.gender || '');
        }
      };
      fetchUser();
    }, [])
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
  const selectedUri = result.assets[0].uri;
  setAvatar(selectedUri);
}
  };

  const handleSave = async () => {
  try {
    if (!user || !user.email) {
      Alert.alert('Error', 'User data is missing.');
      return;
    }

    const updatedUser = {
      ...user,
      fullName,
      youAre,
      companyName,
      location,
      birthday,
      avatar,
      gender,
    };


    // 1. Cập nhật currentUser
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // 2. Cập nhật lại users array
    const usersStr = await AsyncStorage.getItem('users');
    if (usersStr) {
      let users = JSON.parse(usersStr);

      const index = users.findIndex((u: any) => u.email === user.email);
      if (index !== -1) {
        users[index] = updatedUser;
        await AsyncStorage.setItem('users', JSON.stringify(users));
      } else {
        // không tìm thấy => thêm mới (dự phòng)
        users.push(updatedUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
    }

    Alert.alert('Success', 'Profile updated!');
    navigation.goBack();
  } catch (err) {
    console.error('Profile update failed:', err);
    Alert.alert('Error', 'Failed to update profile.');
  }
};



  const onChangeDate = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted =
        selectedDate.getMonth() + 1 + '/' + selectedDate.getDate() + '/' + selectedDate.getFullYear();
      setBirthday(formatted);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4ff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={avatar ? { uri: avatar } : defaultAvatar} style={styles.avatar}/>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Position</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={youAre}
            onValueChange={(itemValue) => setYouAre(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select an option..." value="" enabled={false} />
            <Picker.Item label="Business Owner" value="Business Owner" />
            <Picker.Item label="Team Member" value="Team Member" />
            <Picker.Item label="UI/UX Designer" value="UI/UX Designer" />
            <Picker.Item label="Copywriter" value="Copywriter" />
            <Picker.Item label="Freelancer" value="Freelancer" />
            <Picker.Item label="Student/Academic" value="Student/Academic" />
          </Picker>
        </View>

        <Text style={styles.label}>Company Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your company"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="City, Country"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Birthday</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            value={birthday}
            editable={false}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthday ? new Date(birthday) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select gender..." value="" enabled={false} />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>


        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f4ff',
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  changePhotoText: {
    fontSize: 12,
    color: '#1e88e5',
    textAlign: 'center',
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9fafa',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
