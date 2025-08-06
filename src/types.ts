//src/type.ts
import { Project } from "./Screens/Project/AddProjectScreen";


export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  Calendar: undefined;
  Project: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Vacations: undefined;
  ProjectDetails: { project: Project };
  EmployeeScreen?: undefined;
  MessengerScreen: undefined;
  Conversation: { conversationId: string };
  ChatDetails: {conversationId: string};
  AllEvents: undefined;
  TaskDetails: { projectId: string; taskId: string };
  InfoPortalScreen: undefined;
  TaskOverviewScreen: { project: any; taskId: string | null };
  SettingsScreen: undefined;
  Main: undefined;
};
