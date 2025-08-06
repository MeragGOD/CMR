import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DashboardScreen from './Screens/DashboardScreen/dashboard'; 
import CalendarScreen from './Screens/Event/Calender';
import ProjectScreen from './Screens/Project/Project';
import VacationsScreen from './Screens/Vacation/VacationScreen';
import EmployeeScreen from './Screens/Employee/EmployeeScreen';
import MessengerScreen from './Screens/MessengerScreen/MessengerScreen';
import InfoPortalScreen from './Screens/InfoPortal/InfoPortalScreen';
import SideMenu from './components/SideMenu';
import EditProfileScreen from './Screens/Profile/EditProfileScreen';
import VacationScreen from './Screens/Vacation/VacationScreen';
import ProjectDetailsScreen from './Screens/Project/ProjectDetailsScreen';
import ConversationScreen from './Screens/MessengerScreen/ConservationScreen';
import ChatDetailsScreen from './Screens/MessengerScreen/ChatDetails';
import AllEventsScreen from './Screens/Event/AllEventScreen';
import TaskDetailsScreen from './Screens/Project/TaskDetailsScreens';
import TaskOverviewScreen from './Screens/InfoPortal/TaskOverview';
import SettingsScreen from './Screens/Profile/ProfileSetting';
import ProfileScreen from './Screens/Profile/profile';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
        <Drawer.Navigator
  drawerContent={(props) => <SideMenu {...props} />}
  screenOptions={{
    headerShown: false,
    drawerType: 'front',
    overlayColor: 'transparent',
    swipeEdgeWidth: 30,
    drawerStyle: {
      width: 260,
      backgroundColor: '#fff',
      borderTopRightRadius: 25,
      borderBottomRightRadius: 25,
      elevation: 12,
    },
  }}
>

       <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      {/* <Drawer.Screen name="AddEvent" component={AddEventScreen} /> */}
      <Drawer.Screen name="Project" component={ProjectScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      <Drawer.Screen name="Vacations" component={VacationScreen} />
      <Drawer.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Drawer.Screen name="EmployeeScreen" component={EmployeeScreen} />
      <Drawer.Screen name="MessengerScreen" component={MessengerScreen} />
      <Drawer.Screen name="Conversation" component={ConversationScreen} />
      <Drawer.Screen name="ChatDetails" component={ChatDetailsScreen} />
      <Drawer.Screen name="AllEvents" component={AllEventsScreen} />
      <Drawer.Screen name="TaskDetails" component={TaskDetailsScreen} /> 
      <Drawer.Screen name="InfoPortalScreen" component={InfoPortalScreen} />
      <Drawer.Screen name="TaskOverviewScreen" component={TaskOverviewScreen} />
      <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
