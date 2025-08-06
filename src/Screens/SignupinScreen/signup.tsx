//src/Screens/SignupinScreen/signup
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';


const SignUpScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
 
  // State cho từng bước
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [useServiceFor, setUseServiceFor] = useState('Work');
  const [youAre, setYouAre] = useState('Business Owner');
  const [areYouBest, setAreYouBest] = useState('Yes');

  const [companyName, setCompanyName] = useState('');
  const [businessDirection, setBusinessDirection] = useState('');
  const [teamSize, setTeamSize] = useState('');

  const [members, setMembers] = useState(['']);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.stepTitle}>STEP 1/4</Text>
            <Text style={styles.title}>Valid your phone</Text>

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.input} placeholder="+1 234 567-8900" value={phone} onChangeText={setPhone} />

            {/* <Text style={styles.label}>Code from SMS</Text>
            <View style={styles.codeRow}>
              {code.map((val, i) => (
                <TextInput
                  key={i}
                  style={[styles.input, { width: 40, textAlign: 'center' }]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={val}
                  onChangeText={(text) => {
                    const newCode = [...code];
                    newCode[i] = text;
                    setCode(newCode);
                  }}
                />
              ))}
            </View>

            <Text style={styles.infoText}>SMS was sent to your number. It will be valid for 01:25</Text> */}

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="youremail@gmail.com" value={email} onChangeText={setEmail} />

            <Text style={styles.label}>Create Password</Text>
            <View style={{position:'relative'}}>
            <TextInput style={styles.input} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text>👁️</Text>
                      </TouchableOpacity>
          </View></>
        );
      case 2:
  return (
    <>
      <Text style={styles.stepTitle}>STEP 2/4</Text>
      <Text style={styles.title}>Tell about yourself</Text>

      {/* Dropdown 1 */}
      <Text style={styles.label}>Why will you use the service?</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={useServiceFor}
          onValueChange={(itemValue) => setUseServiceFor(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select an option..." value="" enabled={false} />
          <Picker.Item label="Work" value="Work" />
          <Picker.Item label="Personal" value="Personal" />
          <Picker.Item label="Education" value="Education" />
          <Picker.Item label="Freelance" value="Freelance" />
        </Picker>
      </View>

      {/* Dropdown 2 */}
      <Text style={styles.label}>What describes you best?</Text>
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

      {/* Yes/No Question */}
      <Text style={styles.label}>Is that your primary?</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.radioWrapper}
          onPress={() => setAreYouBest('Yes')}
        >
          <View style={styles.radioCircle}>
            {areYouBest === 'Yes' && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.radioLabel}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioWrapper}
          onPress={() => setAreYouBest('No')}
        >
          <View style={styles.radioCircle}>
            {areYouBest === 'No' && <View style={styles.radioDot} />}
          </View>
          <Text style={styles.radioLabel}>No</Text>
        </TouchableOpacity>
      </View>
    </>
  );

      case 3:
        return (
          <>
            <Text style={styles.stepTitle}>STEP 3/4</Text>
            <Text style={styles.title}>Tell about your company</Text>

            <Text style={styles.label}>Your Company’s Name</Text>
            <TextInput style={styles.input} placeholder="Company’s Name" value={companyName} onChangeText={setCompanyName} />
            <Text style={styles.label}>Business Direction</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={businessDirection}
                onValueChange={(itemValue) => setBusinessDirection(itemValue)}
                style={styles.picker}
              > 
                <Picker.Item label="Select a direction..." value="" enabled={false} />
                <Picker.Item label="IT and Programming" value="IT and Programming" />
                <Picker.Item label="Design and Creative" value="Design and Creative" />
                <Picker.Item label="Marketing and Sales" value="Marketing and Sales" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>


            <Text style={styles.label}>How many people in your team?</Text>
            <View style={styles.grid}>
              {['Only me', '2 - 5', '6 - 10', '11 - 20', '21 - 40', '41 - 50', '51 - 100'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.option, teamSize === size && styles.optionActive]}
                  onPress={() => setTeamSize(size)}
                >
                  <Text>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.stepTitle}>STEP 4/4</Text>
            <Text style={styles.title}>Invite Team Members</Text>

            {members.map((m, idx) => (
              <TextInput
                key={idx}
                style={styles.input}
                placeholder="memberemail@gmail.com"
                value={m}
                onChangeText={(text) => {
                  const newMembers = [...members];
                  newMembers[idx] = text;
                  setMembers(newMembers);
                }}
              />
            ))}

            <TouchableOpacity onPress={() => setMembers([...members, ''])}>
              <Text style={styles.addMember}>+ Add another Member</Text>
            </TouchableOpacity>
          </>
        );
      case 5:const handleCompleteRegistration = async () => {
  const userData = {
    fullName: '',
    phone,
    email,
    password,
    useServiceFor,
    youAre,
    areYouBest,
    companyName,
    businessDirection,
    birthday: '',
    location: '',
    teamSize,
    members,
  };

  try {
    const existingUsers = await AsyncStorage.getItem('users');
    const users = existingUsers ? JSON.parse(existingUsers) : [];

    // Kiểm tra email đã tồn tại
    const emailExists = users.some((user: any) => user.email === email);
    if (emailExists) {
      alert('Email đã tồn tại. Vui lòng dùng email khác.');
      return;
    }

    users.push(userData);
    await AsyncStorage.setItem('users', JSON.stringify(users));

    // Lưu user hiện tại (nếu cần)
    await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

    navigation.replace('SignIn');
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};


    return (
    <>
      <Text style={styles.title}>You are successfully registered!</Text>
      <Image
        source={require('../../assets/SignUp.png')}
        style={styles.successImage}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.button} onPress={handleCompleteRegistration}>
        <Text style={styles.buttonText}>Let’s Start →</Text>
      </TouchableOpacity>
    </>
  );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {renderStep()}

        {step <= 4 && (
          <View style={styles.bottomNav}>
            {step > 1 && (
              <TouchableOpacity onPress={() => setStep(step - 1)}>
                <Text style={styles.prevText}>← Previous</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setStep(step + 1)}>
              <Text style={styles.nextButton}>Next Step →</Text>
            </TouchableOpacity>
          </View> 
        )}
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f2f7ff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 14,
    color: '#1e88e5',
    textAlign: 'center',
    marginBottom: 4,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  successImage: {
  width: '100%',
  height: 200,
  marginVertical: 20,
  borderRadius: 12,
},

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafa',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    backgroundColor: '#e7f0ff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 12,
    color: '#333',
  },
  eyeIcon: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
  row: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  radio: {
    fontSize: 16,
  },
  radioActive: {
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionActive: {
    backgroundColor: '#dbeaff',
    borderColor: '#1e88e5',
  },
  addMember: {
    marginTop: 10,
    color: '#1e88e5',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  prevText: {
    color: '#1e88e5',
    fontWeight: '500',
  },
  nextButton: {
    color: '#fff',
    backgroundColor: '#1e88e5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
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
radioWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
radioCircle: {
  height: 20,
  width: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#1e88e5',
  alignItems: 'center',
  justifyContent: 'center',
},
radioDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#1e88e5',
},
radioLabel: {
  fontSize: 16,
  color: '#333',
  marginRight: 16,
},

});
