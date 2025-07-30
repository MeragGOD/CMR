// styles/dashboardStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PRIMARY_COLOR = '#1e88e5';
const BACKGROUND_COLOR = '#eef4ff';

const styles = StyleSheet.create({
  // --- Dashboard screen ---
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: BACKGROUND_COLOR,
  },
  welcome: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  badge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: '#ef4444', // đỏ
  borderRadius: 10,
  paddingHorizontal: 5,
  minWidth: 18,
  height: 18,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 99,
},

badgeText: {
  color: '#fff',
  fontSize: 11,
  fontWeight: 'bold',
},

  viewAll: {
    color: '#1A73E8',
    fontWeight: '600',
  },
  dateRangeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeaff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateRangeText: {
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: PRIMARY_COLOR,
    fontSize: 14,
  },

  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0f172a',
  },

  

  // === Workload ===
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  workloadCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },

  levelTag: {
    marginTop: 6,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  levelText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },

  // === Project Card ===
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  projectCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },

  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },

  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#0f172a',
  },

  projectDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },

  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  projectStat: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },

  assigneesBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: -8,
    borderWidth: 1,
    borderColor: '#fff',
  },

  moreAssignees: {
    marginLeft: 8,
    fontSize: 12,
    color: '#64748b',
  },

  // === Activity Stream ===
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
  },

  avatarImageSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventCard: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},

eventHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},

eventTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},

eventTime: {
  fontSize: 14,
  color: '#555',
},

priorityBadge: {
  fontSize: 14,
  fontWeight: '500',
},
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#bdd6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  avatarLabel: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },

  // --- AppLayout shared sidebar + topbar ---
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width * 0.75,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 6,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
  },
  sidebarContent: {
    padding: 20,
  },
  menuItem: {
    fontSize: 16,
    marginVertical: 10,
    color: '#444',
  },
  supportButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  supportText: {
    color: '#fff',
    fontWeight: '600',
  },
  logout: {
    marginTop: 24,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 30,
  paddingHorizontal: 16,
  paddingVertical: 10,
  margin: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

searchInput: {
  flex: 1,
  marginHorizontal: 12,
},
avatar1: {
  width: 32,
  height: 32,
  borderRadius: 16,
  marginLeft: 16,
},
  menuButton: {
    marginRight: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: PRIMARY_COLOR,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  addModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  // styles/calendarStyles.ts
  dateText: {
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventPriority: {
    fontSize: 12,
    color: '#777',
  },
  placeholder: {
    flex: 1,
    color: '#aaa',
  },
  
  addcontainer: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  addtitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  addsection: { fontWeight: 'bold', marginVertical: 10 },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 4,
  },
  selectedAvatar: {
    borderColor: '#007bff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '95%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#F6F8FB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F8FB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputNoBorder: {
    flex: 1,
    color: '#333',
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  attachmentRow: {
    flexDirection: 'row',
    marginVertical: 12,
    gap: 16,
  },
  iconButton: {
    backgroundColor: '#F4F4F4',
    padding: 10,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#2e6cf6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay2: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  modalContainer2: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '95%',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  modalTitle2: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },

  // --- Request Type (radio group)
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e88e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#1e88e5',
  },

  // --- Days / Hours toggle
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#e9eef7',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: '#388eff',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '500',
  },

  // Placeholder for calendar / hour content
  placeholder2: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 40,
  },

  // --- Comment input
  commentInput: {
    borderWidth: 1,
    borderColor: '#388eff',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },

  // --- Submit button
  submitButton: {
    backgroundColor: '#388eff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // --- Info Alert (3 days left warning)
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbe9e7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  alertText: {
    color: '#d84315',
    marginLeft: 8,
    fontSize: 13,
  },

  // --- Date / Time fields
  label2: {
    marginTop: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 6,
  },
  repeatButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  repeatButton: {
    padding: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 8,
  },
  activeRepeatButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  repeatButtonText: {
    color: '#000',
  },
  activeRepeatButtonText: {
    color: '#fff',
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    margin: 4,
  },
  activeDay: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayText: {
    color: '#000',
  },
  activeDayText: {
    color: '#fff',
  },
});

export default styles;
