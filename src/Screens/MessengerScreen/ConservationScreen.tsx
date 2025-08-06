import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AppLayout from '../../components/AppLayout';
import AddAttachmentModal from '../../components/AddAttachmentModal';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { addNotification } from '../../components/AddNotification'

const defaultAvatar = require('../../assets/profile.png');

export default function ConversationScreen() {
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const scrollViewRef = useRef<ScrollView>(null);

  const { conversationId } = route.params as { conversationId: string };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionCandidates, setMentionCandidates] = useState<any[]>([]);

  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'file' | 'link' | null>(null);
  const inputRef = useRef<TextInput>(null);

  

  const partnerEmail = conversation?.participants?.find(
    (email: string) => email !== currentUser?.email
  );

  useEffect(() => {
    const fetchData = async () => {
      const currentStr = await AsyncStorage.getItem('currentUser');
      const convoStr = await AsyncStorage.getItem('conversations');
      const usersStr = await AsyncStorage.getItem('users');

      const user = currentStr ? JSON.parse(currentStr) : null;
      const convos = convoStr ? JSON.parse(convoStr) : [];
      const users = usersStr ? JSON.parse(usersStr) : [];

      const thisConvo = convos.find((c: any) => c.id === conversationId);

      setCurrentUser(user);
      setConversation(thisConvo);
      setAllUsers(users);
    };

    fetchData();
  }, []);

  const getUserByEmail = (email: string) => {
    return allUsers.find((u) => u.email === email);
  };

  const getAvatar = (email: string) => {
    const user = getUserByEmail(email);
    return user?.avatar ? { uri: user.avatar } : defaultAvatar;
  };

  const getName = (email: string) => {
    const user = getUserByEmail(email);
    return user?.fullName || email;
  };

  const getYouAre = (email: string) => {
    const user = getUserByEmail(email);
    return user?.youAre || '-';
  };

  const handleSend = async () => {
  if (!input.trim()) return;

  const newMessage = {
    id: Date.now().toString(),
    sender: currentUser.email,
    text: input.trim(),
    createdAt: new Date().toISOString(),
  };

  const updatedConversation = {
    ...conversation,
    updatedAt: new Date().toISOString(),
    messages: [...(conversation.messages || []), newMessage],
  };

  const convosStr = await AsyncStorage.getItem('conversations');
  const convos = convosStr ? JSON.parse(convosStr) : [];

  const newList = convos.map((c: any) =>
    c.id === conversationId ? updatedConversation : c
  );

  await AsyncStorage.setItem('conversations', JSON.stringify(newList));
  setConversation(updatedConversation);
  setInput('');

  // ✅ Gửi notification
  const receiverEmails = conversation.participants.filter(
    (email: string) => email !== currentUser.email
  );

  for (const email of receiverEmails) {
    await addNotification({
      type: 'comment',
      message: 'sent you a message in',
      taskName: conversation.name || '',
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      receiver: email,
    });
  }

  setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, 100);
};

  const handleSendAttachment = async (data: any) => {
  const newMessage = {
    id: Date.now().toString(),
    sender: currentUser.email,
    createdAt: new Date().toISOString(),
    attachment: data, // data.type: 'file' | 'link'
  };

  const updatedConversation = {
    ...conversation,
    updatedAt: new Date().toISOString(),
    messages: [...(conversation.messages || []), newMessage],
  };

  const convosStr = await AsyncStorage.getItem('conversations');
  const convos = convosStr ? JSON.parse(convosStr) : [];

  const newList = convos.map((c: any) =>
    c.id === conversationId ? updatedConversation : c
  );

  await AsyncStorage.setItem('conversations', JSON.stringify(newList));
  setConversation(updatedConversation);
  // Sau khi gửi tin nhắn thành công
  const receiverEmails = conversation.participants.filter((email: string) => email !== currentUser.email);

  for (const email of receiverEmails) {
    await addNotification({
      type: 'comment',
      message: 'sent you a message in',
      taskName: conversation.name || '',
      actorName: currentUser.fullName,
      actorAvatar: currentUser.avatar,
      receiver: email,
    });
  }


  setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, 100);
};


  return (
    <AppLayout showFloatingButton={false}>
      <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>

        <View style={styles.container}>
          {/* Header gốc */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
              <Feather name="arrow-left" size={18} color="#3b82f6" />
              <Text style={styles.backText}>Back to Messenger</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Conversation</Text>
          </View>
          {/* Header của box chat */}
          {conversation && (
            <TouchableOpacity onPress={() => navigation.navigate('ChatDetails', { conversationId })}><View style={styles.chatHeader}>
              {conversation.type === 'group' ? (
                <>
                  <Image
                    source={
                      conversation.groupAvatar
                        ? { uri: conversation.groupAvatar }
                        : defaultAvatar
                    }
                    style={styles.partnerAvatar}
                  />
                  <View>
                    <Text style={styles.partnerName}>{conversation.name}</Text>
                    <Text style={styles.partnerYouAre}>
                      {conversation.participants?.length} members
                    </Text>
                  </View>
                </>
              ) : partnerEmail ? (
                <>
                  <Image source={getAvatar(partnerEmail)} style={styles.partnerAvatar} />
                  <View>
                    <Text style={styles.partnerName}>
                      {`${getName(partnerEmail)} (${partnerEmail})`}
                    </Text>
                    <Text style={styles.partnerYouAre}>{getYouAre(partnerEmail)}</Text>
                  </View>
                </>
              ) : null}
            </View></TouchableOpacity>
          )}
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {conversation?.messages?.map((msg: any, index: number) => {
              const isMe = msg.sender === currentUser.email;

              const currentMsgDate = new Date(msg.createdAt).toDateString();
              const prevMsgDate =
                index > 0
                  ? new Date(conversation.messages[index - 1].createdAt).toDateString()
                  : null;
              const showDate = currentMsgDate !== prevMsgDate;

              return (
                <View key={msg.id}>
                  {showDate && (
                    <View style={styles.dateSeparator}>
                      <Text style={styles.dateText}>
                        {new Date(msg.createdAt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageContainer,
                      isMe ? styles.sent : styles.received,
                    ]}
                  >
                    {!isMe && (
                      <Image
                        source={getAvatar(msg.sender)}
                        style={styles.avatar}
                      />
                    )}
                    <View style={styles.bubble}>
                      {!isMe && (
                        <Text style={styles.sender}>{getName(msg.sender)}</Text>
                      )}<View style={styles.textRow}>
                      {msg.text && (
                      <View style={styles.textRow}>
                        {msg.text.split(' ').map((word: string, idx: React.Key | null | undefined) => {
                          const isMention = word.startsWith('@');
                          return (
                            <Text
                              key={idx}
                              style={isMention ? styles.mentionText : styles.text}
                            >
                              {word + ' '}
                            </Text>
                          );
                        })}
                      </View>
                    )}
                    {msg.attachment && (
                    <View style={{ marginTop: 6 }}>
                      {msg.attachment.type === 'link' && (
                        <TouchableOpacity onPress={() => Linking.openURL(msg.attachment.url)}>
                          <Text style={{ color: '#2563eb', textDecorationLine: 'underline' }}>
                            🔗 {msg.attachment.name || msg.attachment.url}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {msg.attachment.type === 'file' && (
                        <TouchableOpacity onPress={() => Linking.openURL(msg.attachment.url)}>
                          <Text style={{ color: '#10b981' }}>
                            📎 {msg.attachment.name} ({(msg.attachment.size / 1024).toFixed(1)} KB)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                    </View>
                      <Text style={styles.time}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Input */}<View style={styles.inputArea}>
      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef} // 👉 Gắn ref ở đây
          value={input}
          onChangeText={(text) => {
            setInput(text);

            const match = text.split(/\s/).pop();
            if (match && match.startsWith('@')) {
              const keyword = match.slice(1).toLowerCase();
              setMentionQuery(keyword);
              setShowMentionList(true);

              const candidates = conversation?.participants
                .filter((email: string) => email !== currentUser?.email)
                .map((email: string) => getUserByEmail(email))
                .filter((user: { fullName: string }) =>
                  user?.fullName?.toLowerCase().includes(keyword)
                );

              setMentionCandidates(candidates);
            } else {
              setShowMentionList(false);
            }
          }}
          placeholder="Type your message here..."
          placeholderTextColor="#94a3b8"
          style={styles.textInput}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />


        <TouchableOpacity onPress={handleSend} style={styles.inlineSendBtn}>
          <Feather name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ✅ MENTION DROPDOWN ĐÚNG VỊ TRÍ */}
      {showMentionList && mentionCandidates.length > 0 && (
        <View style={styles.mentionDropdown}>
        {mentionCandidates.map((user) => (
          <TouchableOpacity
            key={user.email}
            style={styles.mentionItem}
            activeOpacity={0.7}
            onPress={() => {
              const words = input.trim().split(/\s/);
              words.pop();
              const newText = [...words, `@${user.fullName}`].join(' ') + ' ';
              setInput(newText);
              setShowMentionList(false);
            }}
          >
            <View style={styles.mentionRow}>
              <Image
                source={getAvatar(user.email)}
                style={styles.mentionAvatar}
              />
              <Text style={styles.mentionItemText}>{user.fullName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      )}

  {/* Hiện icon khi focus */}
  {inputFocused && (
  <View style={styles.iconRow}>
    {/* 📎 Add File */}
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={() => {
        setAttachmentType('file');
        setAttachmentModalVisible(true);
      }}
    >
      <Feather name="paperclip" size={20} color="#8b5cf6" />
    </TouchableOpacity>

    {/* 🔗 Add Link */}
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={() => {
        setAttachmentType('link');
        setAttachmentModalVisible(true);
      }}
    >
      <Feather name="link" size={20} color="#06b6d4" />
    </TouchableOpacity>

    {/* 🙂 Emoji (chưa xử lý) */}
            <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            inputRef.current?.focus(); // 👉 Mở bàn phím hệ thống (có thể là emoji nếu bàn phím đang để)
          }}
        >
          <Feather name="smile" size={20} color="#facc15" />
        </TouchableOpacity>

  </View>
)}

</View>

</View>
      </KeyboardAvoidingView>
      <AddAttachmentModal
  visible={attachmentModalVisible}
  onClose={() => setAttachmentModalVisible(false)}
  onSend={(data) => {
    handleSendAttachment(data); // đã có
    setAttachmentModalVisible(false);
  }}
  type={attachmentType}
/>

    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    backgroundColor: '#eef4ff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backText: { color: '#3b82f6', fontSize: 14, marginLeft: 6, fontWeight: '500' },
  screenTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },

  // ✅ NEW: Chat Header (avatar + name + position)
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },

  partnerAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  partnerName: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
  partnerYouAre: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  dateSeparator: { alignItems: 'center', marginVertical: 12 },
  dateText: {
    fontSize: 12,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#475569',
  },
  messageList: { padding: 12, paddingBottom: 100 },
  messageContainer: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  received: {},
  sent: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    backgroundColor: '#eef4ff',
    borderRadius: 12,
  },
  sender: { fontWeight: '600', fontSize: 12, color: '#3b82f6', marginBottom: 4 },
  text: { fontSize: 14, color: '#1e293b' },
  time: { fontSize: 10, color: '#94a3b8', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  mentionDropdown: {
  position: 'absolute',
  bottom: 65,
  left: 12,
  right: 12,
  backgroundColor: '#ffffff',
  borderRadius: 16,
  paddingVertical: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 8,
  zIndex: 999,
},

mentionItem: {
  paddingVertical: 10,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
},

mentionRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

mentionAvatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
  marginRight: 12,
},

mentionItemText: {
  fontSize: 15,
  color: '#0f172a',
  fontWeight: '600',
},
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
icon: {
  marginHorizontal: 4,
},
sendButton: {
  position: 'absolute',
  right: 10,
  bottom: 10,
  backgroundColor: '#3b82f6',
  padding: 12,
  borderRadius: 24,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 2,
},
inputArea: {
  paddingHorizontal: 12,
  paddingTop: 10,
  paddingBottom: 4,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderColor: '#e5e7eb',
},

inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f1f5f9',
  borderRadius: 24,
  paddingHorizontal: 16,
  paddingVertical: 8,
},

textInput: {
  flex: 1,
  fontSize: 14,
  color: '#0f172a',
},
iconRow: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginTop: 8,
  marginLeft: 6,
},

iconBtn: {
  marginRight: 16,
},

inlineSendBtn: {
  backgroundColor: '#3b82f6',
  padding: 10,
  borderRadius: 20,
  marginLeft: 8,
},
textRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},

mentionText: {
  backgroundColor: '#e0f2ff',
  color: '#0284c7',
  fontWeight: '600',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
  overflow: 'hidden',
  marginRight: 4,
  marginBottom: 2,
},
});
