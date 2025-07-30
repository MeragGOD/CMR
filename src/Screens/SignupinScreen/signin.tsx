//src/Screens/SignupinScreen/signin
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
  try {
    const storedUsers = await AsyncStorage.getItem('users');
    if (!storedUsers) {
      alert('No users registered.');
      return;
    }

    const users = JSON.parse(storedUsers);
    const matchedUser = users.find(
      (user: any) => user.email === email && user.password === password
    );

    if (matchedUser) {
      // Lưu thông tin user hiện tại
      await AsyncStorage.setItem('currentUser', JSON.stringify(matchedUser));

      // Nếu cần, có thể xử lý RememberMe ở đây

      navigation.navigate('Dashboard' as never);
    } else {
      alert('Invalid email or password.');
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('An error occurred during sign in.');
  }
};



  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoBlock}>
          {/* Bạn có thể thay logo thật ở đây */}
          <View style={styles.logo} />
          <Text style={styles.brand}>Wookroom</Text>
        </View>

        <Text style={styles.title}>Sign In to Wookroom</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="youremail@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text>👁️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
          />
          <Text style={styles.rememberMe}>Remember me</Text>
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In →</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link} onPress={() => navigation.navigate('SignUp' as never)}>Don’t have an account?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1e88e5',
    marginBottom: 6,
  },
  brand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: Platform.OS === 'ios' ? 14 : 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  rememberMe: {
    marginLeft: 8,
    fontSize: 14,
  },
  forgotWrap: {
    marginLeft: 'auto',
  },
  forgotText: {
    color: '#1e88e5',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    color: '#1e88e5',
  },
});
