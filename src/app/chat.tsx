import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { apiRequest } from '@/api/client';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/GlassCard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

/** Strip simple HTML tags into plain text segments with basic bold/italic styling support */
function parseHtml(raw: string): string {
  return raw
    .replace(/<b>(.*?)<\/b>/gs, '$1')
    .replace(/<i>(.*?)<\/i>/gs, '$1')
    .replace(/<code>(.*?)<\/code>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Animated typing indicator — 3 bouncing dots */
function TypingDots({ color }: { color: string }) {
  return (
    <View style={tdStyles.row}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ translateY: 0 }}
          animate={{ translateY: -5 }}
          transition={{
            type: 'timing',
            duration: 450,
            loop: true,
            delay: i * 150,
            repeatReverse: true,
          }}
          style={[tdStyles.dot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}
const tdStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, paddingVertical: 6, paddingHorizontal: 2 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = true;
  const colors = Colors.dark;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '🤖 <b>Hello! I am your Pami AI Assistant.</b>\n\nAsk me anything — I can manage your Notion inbox, trigger workflows, or fetch memes. Try: <i>"task call clients"</i> or <i>"/meme coding"</i>.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText;
    setInputText('');

    const userMsg: Message = {
      id: Math.random().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await apiRequest('chat', 'POST', { message: text });
      const aiMsg: Message = {
        id: Math.random().toString(),
        text: typeof res === 'string' ? res : (res?.reply || res?.message || 'No response.'),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: Math.random().toString(),
        text: `⚠️ Error: ${err.message}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, sending]);

  return (
    <View style={[styles.container, { paddingBottom: isKeyboardVisible ? 0 : 100, paddingTop: insets.top + 16 }]}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* ── Messages Feed ── */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <MotiView
                key={msg.id}
                from={{ opacity: 0, translateY: 14, scale: 0.94 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 24, stiffness: 280, delay: 0 }}
                style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}
              >
                {!isUser && (
                  <View style={styles.avatarAi}>
                    <Ionicons name="sparkles" size={14} color="#818cf8" />
                  </View>
                )}

                {isUser ? (
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.bubble, styles.bubbleUser]}
                  >
                    <Text style={styles.bubbleTextUser}>{msg.text}</Text>
                  </LinearGradient>
                ) : (
                  <GlassCard borderRadius={18} padding={12} style={styles.bubbleAi} intensity={14}>
                    <Text style={[styles.bubbleTextAi, { color: colors.text }]}>
                      {parseHtml(msg.text)}
                    </Text>
                  </GlassCard>
                )}
              </MotiView>
            );
          })}

          {/* ── Typing indicator ── */}
          {sending && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[styles.msgRow, styles.msgRowAi]}
            >
              <View style={styles.avatarAi}>
                <Ionicons name="sparkles" size={14} color="#818cf8" />
              </View>
              <GlassCard borderRadius={18} padding={12} style={styles.bubbleAi} intensity={14}>
                <TypingDots color={colors.primary} />
              </GlassCard>
            </MotiView>
          )}

          <View style={{ height: 130 }} />
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={styles.inputWrapper}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={55} tint="dark" style={[StyleSheet.absoluteFillObject, styles.inputBlur]} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(8,9,18,0.93)' }]} />
          )}
          <View style={[styles.inputRow, { borderTopColor: 'rgba(255,255,255,0.09)' }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Ask anything or type /meme, /todo..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending || !inputText.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={sending || !inputText.trim() ? ['#374151', '#4b5563'] : ['#6366f1', '#a855f7']}
                style={styles.sendBtn}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="arrow-up" size={18} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAi: { justifyContent: 'flex-start' },
  avatarAi: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(129,140,248,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  bubble: { maxWidth: '78%', borderRadius: 20 },
  bubbleUser: { paddingHorizontal: 16, paddingVertical: 11, borderBottomRightRadius: 6 },
  bubbleAi: { maxWidth: '78%', borderBottomLeftRadius: 6 },
  bubbleTextUser: { color: '#fff', fontSize: 15, lineHeight: 21, fontWeight: '500' },
  bubbleTextAi: { fontSize: 15, lineHeight: 22 },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
  },
  inputBlur: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.09)' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 14,
    gap: 10,
    borderTopWidth: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 120,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
