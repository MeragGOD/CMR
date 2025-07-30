import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './Screens/SignupinScreen/signin';
import SignUpScreen from './Screens/SignupinScreen/signup';
import DashboardScreen from './Screens/DashboardScreen/dashboard';
import CalendarScreen from './Screens/Event/Calender';
// import AddEventScreen from './Screens/Event/AddEventScreen';
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

const Stack = createNativeStackNavigator<RootStackParamList>();


export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      {/* <Stack.Screen name="AddEvent" component={AddEventScreen} /> */}
      <Stack.Screen name="Project" component={ProjectScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Vacations" component={VacationScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="EmployeeScreen" component={EmployeeScreen} />
      <Stack.Screen name="MessengerScreen" component={MessengerScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} />
      <Stack.Screen name="AllEvents" component={AllEventsScreen} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} /> 
      <Stack.Screen name="InfoPortalScreen" component={InfoPortalScreen} />
      <Stack.Screen name="TaskOverviewScreen" component={TaskOverviewScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
