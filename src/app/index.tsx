import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { apiRequest } from '@/api/client';
import { Colors, Gradients, StatusColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import AnimatedStatCard from '@/components/AnimatedStatCard';

interface DashboardData {
  tasksCount: { todo: number; inProgress: number; done: number; failed: number };
  instagram: { username: string; followers: number; following: number; mediaCount: number } | null;
  recentTasks: any[];
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = true; // Forced Deep Space Glass theme
  const colors = Colors.dark;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orchestratorRunning, setOrchestratorRunning] = useState(false);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDashboardData(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchDashboardData(true); };

  const handleRunOrchestrator = async () => {
    setOrchestratorRunning(true);
    try {
      await apiRequest('runOrchestrator', 'POST');
      fetchDashboardData(true);
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setOrchestratorRunning(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          style={styles.loadingInner}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Pami AI…</Text>
        </MotiView>
      </View>
    );
  }

  const ts = data?.tasksCount || { todo: 0, inProgress: 0, done: 0, failed: 0 };

  return (
    <View style={styles.container}>
      {/* Logo Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top + 16,
        paddingBottom: 24,
      }}>
        <Image
          source={require('../../assets/images/PamiAI-logo.png')}
          style={{ width: 48, height: 48, marginRight: 12 }}
          contentFit="contain"
        />
        <Image
          source={require('../../assets/images/pami-text.png')}
          style={{ width: 200, height: 50 }}
          contentFit="contain"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Error Banner ── */}
        {error && (
          <MotiView
            from={{ opacity: 0, translateX: -12 }}
            animate={{ opacity: 1, translateX: 0 }}
          >
            <GlassCard style={styles.errorCard} borderRadius={14} padding={14}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </GlassCard>
          </MotiView>
        )}

        {/* ── Section Label ── */}
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 80 }}>
          <Text style={[styles.section, { color: colors.textSecondary }]}>Notion Tasks</Text>
        </MotiView>

        {/* ── Stat Cards Grid ── */}
        <View style={styles.statsGrid}>
          <AnimatedStatCard
            delay={100}
            value={ts.todo}
            label="Todo"
            glowColor="rgba(96,165,250,0.5)"
            onPress={() => router.push('/tasks')}
            icon={<Ionicons name="time" size={20} color="#60a5fa" />}
          />
          <AnimatedStatCard
            delay={180}
            value={ts.inProgress}
            label="In Progress"
            glowColor="rgba(250,204,21,0.45)"
            onPress={() => router.push('/tasks')}
            icon={<Ionicons name="sync" size={20} color="#facc15" />}
          />
          <AnimatedStatCard
            delay={260}
            value={ts.done}
            label="Completed"
            glowColor="rgba(52,211,153,0.45)"
            onPress={() => router.push('/tasks')}
            icon={<Ionicons name="checkmark-circle" size={20} color="#34d399" />}
          />
          <AnimatedStatCard
            delay={340}
            value={ts.failed}
            label="Failed"
            glowColor="rgba(248,113,113,0.45)"
            onPress={() => router.push('/tasks')}
            icon={<Ionicons name="close-circle" size={20} color="#f87171" />}
          />
        </View>

        {/* ── Instagram Card ── */}
        {data?.instagram && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 22, delay: 400 }}
            style={{ marginBottom: 28 }}
          >
            <Text style={[styles.section, { color: colors.textSecondary }]}>Instagram Analytics</Text>
            <GlassCard borderRadius={20} padding={0} glowColor="rgba(225,48,108,0.35)" style={styles.igCard}>
              <LinearGradient
                colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.igGradientHeader}
              >
                <Ionicons name="logo-instagram" size={20} color="#fff" />
                <Text style={styles.igUsername}>@{data.instagram.username}</Text>
              </LinearGradient>
              <View style={styles.igStats}>
                {[
                  { label: 'Followers', value: data.instagram.followers.toLocaleString() },
                  { label: 'Following', value: data.instagram.following.toLocaleString() },
                  { label: 'Posts', value: data.instagram.mediaCount },
                ].map((stat, i) => (
                  <View key={stat.label} style={styles.igStatTile}>
                    {i !== 0 && <View style={styles.igDivider} />}
                    <Text style={[styles.igValue, { color: colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.igLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </MotiView>
        )}

        {/* ── Recent Logs ── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 480 }}
        >
          <Text style={[styles.section, { color: colors.textSecondary }]}>Recent Logs</Text>
        </MotiView>
        <View style={styles.logs}>
          {data?.recentTasks && data.recentTasks.length > 0 ? (
            data.recentTasks.map((t, i) => {
              const sc = StatusColors[t.status] || StatusColors['Todo'];
              return (
                <MotiView
                  key={t.id}
                  from={{ opacity: 0, translateX: -12 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 500 + i * 60 }}
                >
                  <GlassCard borderRadius={14} padding={12} style={styles.logCard}>
                    <View style={styles.logLeft}>
                      <View style={[styles.platformBadge, { backgroundColor: colors.backgroundElement }]}>
                        <Text style={[styles.platformText, { color: colors.text }]}>{t.platform}</Text>
                      </View>
                      <Text style={[styles.logName, { color: colors.text }]} numberOfLines={1}>{t.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg, shadowColor: sc.glow }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{t.status}</Text>
                    </View>
                  </GlassCard>
                </MotiView>
              );
            })
          ) : (
            <GlassCard borderRadius={14} padding={24} style={styles.emptyCard}>
              <Ionicons name="cloud-outline" size={28} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent tasks found</Text>
            </GlassCard>
          )}
        </View>

        {/* bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingInner: { alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },
  scroll: { paddingHorizontal: 18, paddingTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  errorText: { flex: 1, fontSize: 13, fontWeight: '500' },
  section: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  igCard: { overflow: 'hidden' },
  igGradientHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  igUsername: { fontSize: 15, fontWeight: '700', color: '#fff' },
  igStats: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 8 },
  igStatTile: { flex: 1, alignItems: 'center', flexDirection: 'row' },
  igValue: { fontSize: 17, fontWeight: '800', flex: 1, textAlign: 'center' },
  igLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center', flex: 1 },
  igDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.10)', alignSelf: 'center' },
  logs: { gap: 8 },
  logCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  platformBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  platformText: { fontSize: 10, fontWeight: '700' },
  logName: { fontSize: 13, fontWeight: '500', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, shadowOpacity: 0.5, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyCard: { alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 14 },
});
