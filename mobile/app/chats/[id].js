import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, StyleSheet, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { useGetChatHistoryQuery, useSendMessageMutation } from '../../redux/api/chatApi';
import { useGetUserByIdQuery } from '../../redux/api/userApi';
import { useTheme } from '../../context/ThemeContext';
import io from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

export default function ChatDetailScreen() {
  const { id: receiverId, contactName } = useLocalSearchParams();
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);
  const { isDark, toggleTheme, colors: c } = useTheme();

  const [message, setMessage] = useState('');
  const socket = useRef(null);
  const flatListRef = useRef(null);

  const { data: receiver, isLoading: receiverLoading } = useGetUserByIdQuery(receiverId, {
    skip: !receiverId || !currentUser,
  });

  const { data: history, isLoading } = useGetChatHistoryQuery(receiverId, {
    skip: !receiverId || !currentUser,
  });
  const [sendMsgMutation] = useSendMessageMutation();
  const [chatMessages, setChatMessages] = useState([]);

  const roomId = currentUser && receiverId
    ? [currentUser._id, receiverId].sort().join('_')
    : null;

  useEffect(() => {
    if (!currentUser) router.replace('/(auth)/login');
  }, [currentUser]);

  useEffect(() => {
    if (history) setChatMessages(history);
  }, [history]);

  useEffect(() => {
    if (!roomId) return;
    socket.current = io(SOCKET_URL);
    socket.current.emit('join_room', roomId);
    socket.current.on('receive_message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });
    return () => socket.current.disconnect();
  }, [roomId]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser || !roomId) return;
    const messageData = {
      sender: currentUser._id,
      receiver: receiverId,
      message: message.trim(),
      room: roomId,
      createdAt: new Date().toISOString(),
    };
    try {
      socket.current.emit('send_message', messageData);
      await sendMsgMutation({ receiverId, message: message.trim(), room: roomId }).unwrap();
      setChatMessages(prev => [...prev, messageData]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (!currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: c.bg }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>

        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.cardBorder }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: isDark ? '#252540' : '#F1F5F9' }]}
          >
            <Ionicons name="chevron-back" size={22} color={c.text} />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={[styles.receiverAvatar, { backgroundColor: isDark ? '#1e2a45' : '#EFF6FF' }]}>
            {receiver?.profileImage ? (
              <Image source={{ uri: `${BASE_URL}${receiver.profileImage}` }} style={styles.receiverAvatarImg} />
            ) : (
              <Text style={styles.receiverAvatarText}>{getInitials(contactName || receiver?.name)}</Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.receiverName, { color: c.text }]} numberOfLines={1}>
              {contactName || receiver?.name || '...'}
            </Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { color: c.subText }]}>Active now</Text>
            </View>
          </View>

          {/* Dark Mode Toggle */}
          <View style={[styles.togglePill, { backgroundColor: isDark ? '#252540' : '#F1F5F9' }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={14} color={isDark ? '#818CF8' : '#F59E0B'} />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }] }}
            />
          </View>
        </View>

        {/* ── Messages ── */}
        <View style={[styles.messagesArea, { backgroundColor: isDark ? '#0c0c1a' : '#F8FAFC' }]}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              keyExtractor={(item, index) => item._id || index.toString()}
              contentContainerStyle={{ padding: 18, paddingBottom: 24 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                const isMine = item.sender === currentUser._id;
                return (
                  <View style={[styles.msgRow, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}>
                    <View style={[
                      styles.msgBubble,
                      isMine
                        ? { backgroundColor: '#2563EB', borderTopRightRadius: 4 }
                        : {
                            backgroundColor: c.card,
                            borderTopLeftRadius: 4,
                            borderWidth: 1,
                            borderColor: c.cardBorder,
                          },
                    ]}>
                      <Text style={[styles.msgText, { color: isMine ? '#fff' : c.text }]}>
                        {item.message}
                      </Text>
                      <View style={styles.msgMeta}>
                        <Text style={[styles.msgTime, { color: isMine ? 'rgba(255,255,255,0.6)' : c.subText }]}>
                          {formatTime(item.createdAt)}
                        </Text>
                        {isMine && <Ionicons name="checkmark-done" size={11} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* ── Input Bar ── */}
        <View style={[styles.inputBar, { backgroundColor: c.card, borderTopColor: c.cardBorder }]}>
          <TouchableOpacity style={[styles.attachBtn, { backgroundColor: isDark ? '#252540' : '#F1F5F9' }]}>
            <Ionicons name="add" size={22} color={c.icon} />
          </TouchableOpacity>

          <View style={[styles.inputBox, { backgroundColor: isDark ? '#252540' : '#F1F5F9', borderColor: c.cardBorder }]}>
            <TextInput
              placeholder="Type your message..."
              placeholderTextColor={c.placeholder}
              style={[styles.input, { color: c.text }]}
              multiline
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: message.trim() ? '#2563EB' : (isDark ? '#252540' : '#E2E8F0') },
            ]}
            activeOpacity={0.85}
          >
            <Ionicons name="paper-plane" size={18} color={message.trim() ? '#fff' : c.icon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  receiverAvatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  receiverAvatarImg: { width: '100%', height: '100%' },
  receiverAvatarText: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
  receiverName: { fontSize: 15, fontWeight: '700' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 11, fontWeight: '600' },
  togglePill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, paddingHorizontal: 6, paddingVertical: 3, gap: 2,
  },

  messagesArea: { flex: 1 },
  msgRow: { flexDirection: 'row', marginBottom: 14 },
  msgBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  msgTime: { fontSize: 10, fontWeight: '500' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, gap: 8,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  inputBox: {
    flex: 1, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, maxHeight: 120,
  },
  input: { fontSize: 14 },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
});
