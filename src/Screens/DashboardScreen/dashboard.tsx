import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppLayout from '../../components/AppLayout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../components/styles';
import EventCard from '../../components/Cards/Events';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

const defaultAvatar = require('../../assets/profile.png');

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);


  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dateRangeLabel = `${formatDate(startOfMonth)} – ${formatDate(endOfMonth)}`;

  const enrichTasksWithUserInfo = (tasks: any[], users: any[]) => {
    return tasks.map(task => {
      const matchedUser = users.find((u: any) => u.email === task.assignee);
      const fullName =
        typeof matchedUser?.fullName === 'string'
          ? matchedUser.fullName
          : matchedUser?.fullName?.name || task.assignee;

      return {
        ...task,
        assigneeName: fullName,
        assigneeAvatar: matchedUser?.avatar || '',
      };
    });
  };

  useFocusEffect(
    useCallback(() => {
      const loadDashboardData = async () => {
        const user = await AsyncStorage.getItem('currentUser');
        const currentUser = user ? JSON.parse(user) : null;
        if (!currentUser) return;

        const usersStr = await AsyncStorage.getItem('users');
        const users = usersStr ? JSON.parse(usersStr) : [];
        setAllUsers(users);

        // Events
        const eventData = await AsyncStorage.getItem('events');
        const allEvents = eventData ? JSON.parse(eventData) : [];
        const futureEvents = allEvents
          .filter((e: any) => e.time > new Date().toISOString() && e.createdBy === currentUser.email)
          .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
          .slice(0, 3);
        setEvents(futureEvents);

        // Members
        const membersData = await AsyncStorage.getItem(`members_${currentUser.email}`);
        if (membersData && usersStr) {
          const memberEmails = JSON.parse(membersData);
          const enrichedMembers = memberEmails.map((member: any) => {
            const profile = users.find((u: any) => u.email === member.email) || {};
            return {
              ...member,
              ...profile,
              name: member.name || profile.name || member.email.split('@')[0],
              avatar: member.avatar || profile.avatar || '',
              position: member.position || profile.position || 'Employee',
              level: member.level || profile.level || 'Junior',
            };
          });
          setMembers(enrichedMembers.slice(0, 6));
        }

        // Projects
        const projectData = await AsyncStorage.getItem('projects');
        const allProjects = projectData ? JSON.parse(projectData) : [];
        const userProjects = allProjects.filter((p: any) => {
          if (p.createdBy === currentUser.email) return true;
          return (p.tasks || []).some((t: any) => t.assignee === currentUser.email);
        });
        const enrichedProjects = userProjects.map((p: any) => ({
          ...p,
          tasks: enrichTasksWithUserInfo(p.tasks || [], users),
        }));
        setProjects(enrichedProjects.slice(0, 3));

        // Activity logs
        const logsData = await AsyncStorage.getItem('activityLogs');
        const logs = logsData ? JSON.parse(logsData) : [];
        const userLogs = logs
          .filter((log: any) => log.userEmail === currentUser.email)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setActivities(userLogs);
      };

      loadDashboardData();
    }, [])
  );

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.title}>Dashboard</Text>

        <View style={styles.dateRangeBox}>
          <Feather name="calendar" size={16} color="#1e88e5" style={{ marginRight: 6 }} />
          <Text style={styles.dateRangeText}>{dateRangeLabel}</Text>
        </View>

        {/* Workload */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workload</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmployeeScreen')}>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowWrap}>
            {members.map((member, idx) => (
              <View key={idx} style={styles.workloadCard}>
                <Image source={member.avatar ? { uri: member.avatar } : defaultAvatar} style={styles.avatarImage} />
                <Text style={styles.cardTitle}>{member.name}</Text>
                <Text style={styles.cardSubtitle}>{member.position}</Text>
                <View style={styles.levelTag}>
                  <Text style={styles.levelText}>{member.level}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Project')}>
              <Text style={styles.viewAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          {projects.map((project: any, idx: number) => {
          const totalTasks = project.tasks?.length || 0;
          const activeTasks = project.tasks?.filter((t: any) => t.status !== 'Done').length || 0;

          // 1. Lấy người tạo
          const reporterUser = allUsers.find((u: any) => u.email === project.createdBy);
          const reporter = {
            email: project.createdBy,
            avatar: reporterUser?.avatar || '',
            name:
              typeof reporterUser?.fullName === 'string'
                ? reporterUser.fullName
                : reporterUser?.fullName?.name || project.createdBy,
          };

          // 2. Lấy danh sách các assignee (trừ người tạo)
          const taskAssignees = (project.tasks || [])
            .map((t: any) => ({
              email: t.assignee,
              avatar: t.assigneeAvatar,
              name: t.assigneeName,
            }))
            .filter((a: { email: any; }) => a.email !== project.createdBy);

          // 3. Kết hợp reporter + assignees, loại trùng theo email
          const combined = [reporter, ...taskAssignees];
          const uniqueAssignees = Array.from(
            new Map(combined.map(a => [a.email, a])).values()
          );



            return (
              <View key={idx} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectCode}>PN{project.id}</Text>
                </View>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectDate}>
                  Created {project.createdAt ? formatDate(new Date(project.createdAt)) : '—'}
                </Text>
                <View style={styles.projectStats}>
                  <Text style={styles.projectStat}>All tasks{'\n'}{totalTasks}</Text>
                  <Text style={styles.projectStat}>Active tasks{'\n'}{activeTasks}</Text>
                  <View style={styles.assigneesBox}>
                    {uniqueAssignees.slice(0, 3).map((a, i) => (
                    <Image
                      key={i}
                      source={a.avatar ? { uri: a.avatar } : defaultAvatar}
                      style={styles.assigneeAvatar}
                    />
                  ))}
                  {uniqueAssignees.length > 3 && (
                    <Text style={styles.moreAssignees}>+{uniqueAssignees.length - 3}</Text>
                  )}

                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Nearest Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearest Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllEvents')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {events.length === 0 ? (
            <Text style={{ color: '#888', marginTop: 8 }}>No upcoming events.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 12 }}>
              {events.map((event, idx) => (
                <EventCard key={event.id || idx} event={event} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Activity Stream */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Stream</Text>
          </View>
          {activities.length === 0 ? (
            <Text style={{ color: '#888' }}>No recent activities.</Text>
          ) : (
            activities.map((log, idx) => (
              <View key={idx} style={styles.activityItem}>
                <Image source={log.userAvatar ? { uri: log.userAvatar } : defaultAvatar} style={styles.avatarImageSmall} />
                <View>
                  <Text style={styles.cardTitle}>{log.userName || 'You'}</Text>
                  <Text style={styles.cardSubtitle}>{log.message}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
}
