import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiConfig, saveApiConfig, apiRequest } from '@/api/client';
import { Colors, Gradients } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';

interface CreditsData {
  gemini: { used: number; requests: number };
  opencode: { sessions: number; tokens: number };
}

function SectionLabel({ children }: { children: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';
  return (
    <Text style={[sectionStyle.label, { color: isDark ? 'rgba(248,250,252,0.45)' : 'rgba(15,23,42,0.45)' }]}>
      {children}
    </Text>
  );
}
const sectionStyle = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginTop: 20, paddingHorizontal: 2 },
});

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = true;
  const colors = Colors.dark;

  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadConfig(); fetchCredits(); }, []);

  const loadConfig = async () => {
    const config = await getApiConfig();
    setApiUrl(config.apiUrl);
    setApiKey(config.apiKey);
  };

  const fetchCredits = async () => {
    setLoadingCredits(true);
    try {
      const res = await apiRequest('credits');
      setCredits(res);
    } catch {} finally { setLoadingCredits(false); }
  };

  const handleSaveConfig = async () => {
    if (!apiUrl.trim() || !apiKey.trim()) { alert('Both API URL and API Key are required.'); return; }
    try {
      await saveApiConfig(apiUrl, apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      fetchCredits();
    } catch (err: any) { alert(`Save failed: ${err.message}`); }
  };

  const handleSendEmailReport = async () => {
    setSendingEmail(true);
    try {
      await apiRequest('sendEmail', 'POST');
      alert('📧 Email report sent successfully!');
    } catch (err: any) { alert(`Failed: ${err.message}`); }
    finally { setSendingEmail(false); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Profile/Status Hero ── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <GlassCard borderRadius={22} padding={0} glowColor="rgba(99,102,241,0.28)" style={{ overflow: 'hidden', marginBottom: 8 }}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroAvatar}>
                <Ionicons name="sparkles" size={26} color="#fff" />
              </View>
              <View>
                <Text style={styles.heroTitle}>Pami AI</Text>
                <Text style={styles.heroSub}>Automation Command Center</Text>
              </View>
            </LinearGradient>
          </GlassCard>
        </MotiView>

        {/* ── API Configuration ── */}
        <SectionLabel>Connection</SectionLabel>
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 80 }}>
          <GlassCard borderRadius={18} padding={16} style={{ gap: 12 }}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Server URL</Text>
              <View style={[styles.inputWrap, { borderColor: colors.border }]}>
                <Ionicons name="server-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="https://your-vercel-app.vercel.app"
                  placeholderTextColor={colors.textSecondary}
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>API Key</Text>
              <View style={[styles.inputWrap, { borderColor: colors.border }]}>
                <Ionicons name="key-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="your-mobile-api-key"
                  placeholderTextColor={colors.textSecondary}
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>
            <GlowButton
              label={saved ? '✓ Saved!' : 'Save Configuration'}
              onPress={handleSaveConfig}
              colors={saved ? ['#059669', '#10b981'] : ['#6366f1', '#8b5cf6']}
              icon={<Ionicons name={saved ? 'checkmark-circle' : 'save-outline'} size={16} color="#fff" />}
              style={{ marginTop: 4 }}
            />
          </GlassCard>
        </MotiView>

        {/* ── Credits Usage ── */}
        <SectionLabel>Credits & Usage</SectionLabel>
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 160 }}>
          {loadingCredits ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : credits ? (
            <View style={styles.creditsGrid}>
              {[
                { icon: 'flash', label: 'Gemini Requests', value: credits.gemini.requests, glow: 'rgba(99,102,241,0.4)' },
                { icon: 'code-slash', label: 'Gemini Tokens', value: credits.gemini.used, glow: 'rgba(168,85,247,0.4)' },
                { icon: 'terminal', label: 'AI Sessions', value: credits.opencode.sessions, glow: 'rgba(16,185,129,0.4)' },
                { icon: 'layers', label: 'AI Tokens', value: credits.opencode.tokens, glow: 'rgba(245,158,11,0.4)' },
              ].map((c, i) => (
                <MotiView
                  key={c.label}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 200 + i * 60 }}
                  style={{ width: '48%' }}
                >
                  <GlassCard borderRadius={16} padding={14} glowColor={c.glow}>
                    <Ionicons name={c.icon as any} size={18} color={colors.primary} />
                    <Text style={[styles.creditValue, { color: colors.text }]}>{c.value?.toLocaleString?.() ?? '—'}</Text>
                    <Text style={[styles.creditLabel, { color: colors.textSecondary }]}>{c.label}</Text>
                  </GlassCard>
                </MotiView>
              ))}
            </View>
          ) : (
            <GlassCard borderRadius={16} padding={16}>
              <Text style={[styles.creditLabel, { color: colors.textSecondary }]}>Connect to your server to see usage stats</Text>
            </GlassCard>
          )}
        </MotiView>

        {/* ── Actions ── */}
        <SectionLabel>Actions</SectionLabel>
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 280 }}>
          <GlassCard borderRadius={18} padding={16} style={{ gap: 12 }}>
            <GlowButton
              label="Send Email Report"
              onPress={handleSendEmailReport}
              loading={sendingEmail}
              colors={['#0891b2', '#06b6d4']}
              icon={<Ionicons name="mail-outline" size={16} color="#fff" />}
            />
            <GlowButton
              label="Refresh Credits"
              onPress={fetchCredits}
              loading={loadingCredits}
              colors={['#4b5563', '#6b7280']}
              icon={<Ionicons name="refresh-outline" size={16} color="#fff" />}
            />
          </GlassCard>
        </MotiView>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  heroGradient: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  heroAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.20)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.70)', marginTop: 2 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  textInput: { flex: 1, fontSize: 14, lineHeight: 20 },
  creditsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  creditValue: { fontSize: 22, fontWeight: '800', marginTop: 8, letterSpacing: -0.5 },
  creditLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
