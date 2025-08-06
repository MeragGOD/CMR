import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './Screens/SignupinScreen/signin';
import SignUpScreen from './Screens/SignupinScreen/signup';
import DashboardScreen from './Screens/DashboardScreen/dashboard';
import CalendarScreen from './Screens/Event/Calender';
// import AddEventScreen from './Screens/Event/AddEventScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProjectScreen from './Screens/Project/Project';
import ProfileScreen from './Screens/Profile/profile';
import EditProfileScreen from './Screens/Profile/EditProfileScreen';
import VacationScreen from './Screens/Vacation/VacationScreen';
import ProjectDetailsScreen from './Screens/Project/ProjectDetailsScreen';
import EmployeeScreen from './Screens/Employee/EmployeeScreen';
import { RootStackParamList } from './types';
import MessengerScreen from './Screens/MessengerScreen/MessengerScreen';
import ConversationScreen from './Screens/MessengerScreen/ConservationScreen';
import ChatDetailsScreen from './Screens/MessengerScreen/ChatDetails';
import AllEventsScreen from './Screens/Event/AllEventScreen';
import TaskDetailsScreen from './Screens/Project/TaskDetailsScreens';
import InfoPortalScreen from './Screens/InfoPortal/InfoPortalScreen';
import TaskOverviewScreen from './Screens/InfoPortal/TaskOverview';
import SettingsScreen from './Screens/Profile/ProfileSetting';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();


export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);
