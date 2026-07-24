import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Linking,
  Modal,
} from 'react-native';
import { MotiView } from 'moti';
import { apiRequest } from '@/api/client';
import { Colors, StatusColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import ScreenHeader from '@/components/ScreenHeader';
import { SkeletonRow } from '@/components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Task {
  id: string;
  name: string;
  platform: string;
  status: string;
  priority: string;
  details: string;
  result?: string;
}

const FILTERS = ['All', 'Todo', 'In Progress', 'Done', 'Failed'] as const;
type Filter = typeof FILTERS[number];

const PRIORITY_COLORS: Record<string, { text: string; bg: string }> = {
  High:   { text: '#f87171', bg: 'rgba(248,113,113,0.15)' },
  Medium: { text: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  Low:    { text: '#34d399', bg: 'rgba(52,211,153,0.15)' },
};

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const isDark = true;
  const colors = Colors.dark;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);

  const fetchTasks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiRequest('tasks', 'GET', null);
      setTasks(res || []);
    } catch (err: any) {
      alert(`Error loading tasks: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTasks(); }, []));
  const onRefresh = () => { setRefreshing(true); fetchTasks(true); };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiRequest('updateTask', 'POST', { taskId, status: newStatus });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchTasks(true);
      if (selectedTask?.id === taskId) setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) { alert(`Failed to update status: ${err.message}`); }
  };

  const handleConfirmPost = async (taskId: string) => {
    setConfirmingTaskId(taskId);
    try {
      await apiRequest('confirmPost', 'POST', { taskId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert('🚀 Published to Instagram!');
      fetchTasks(true);
      setSelectedTask(null);
    } catch (err: any) { alert(`Publishing failed: ${err.message}`); }
    finally { setConfirmingTaskId(null); }
  };

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Tasks" subtitle="Automation Queue" />

      {/* ── Filter Chips Row ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTERS.map((tab) => {
          const active = filter === tab;
          const sc = tab !== 'All' ? StatusColors[tab] : null;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => { Haptics.selectionAsync(); setFilter(tab); }}
              activeOpacity={0.75}
            >
              <MotiView
                animate={{
                  scale: active ? 1.04 : 1,
                }}
                transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              >
                {active ? (
                  <LinearGradient
                    colors={['#6366f1', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chip}
                  >
                    <Text style={[styles.chipText, { color: '#fff' }]}>{tab}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                  }]}>
                    <Text style={[styles.chipText, { color: colors.textSecondary }]}>{tab}</Text>
                  </View>
                )}
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: 10, marginTop: 4 }}>
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </View>
        ) : filteredTasks.length === 0 ? (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
            <Ionicons name="documents-outline" size={52} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks in "{filter}"</Text>
          </MotiView>
        ) : (
          filteredTasks.map((task, i) => {
            const sc = StatusColors[task.status] || StatusColors['Todo'];
            const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS['Low'];
            return (
              <MotiView
                key={task.id}
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 22, delay: i * 55 }}
              >
                <TouchableOpacity activeOpacity={0.78} onPress={() => setSelectedTask(task)}>
                  <GlassCard
                    borderRadius={18}
                    padding={14}
                    style={styles.taskCard}
                    glowColor={sc.glow}
                  >
                    {/* Left glow bar */}
                    <View style={[styles.leftBar, { backgroundColor: sc.text }]} />

                    <View style={styles.taskBody}>
                      <View style={styles.taskBadgeRow}>
                        <View style={[styles.badge, { backgroundColor: colors.backgroundElement }]}>
                          <Text style={[styles.badgeText, { color: colors.text }]}>{task.platform}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.badgeText, { color: sc.text }]}>{task.status}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: pc.bg }]}>
                          <Text style={[styles.badgeText, { color: pc.text }]}>{task.priority}</Text>
                        </View>
                      </View>
                      <Text style={[styles.taskName, { color: colors.text }]} numberOfLines={2}>{task.name}</Text>
                      {task.details ? (
                        <Text style={[styles.taskDetails, { color: colors.textSecondary }]} numberOfLines={1}>{task.details}</Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </GlassCard>
                </TouchableOpacity>
              </MotiView>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal visible={!!selectedTask} transparent animationType="slide" onRequestClose={() => setSelectedTask(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedTask(null)}>
          <MotiView
            from={{ translateY: 400, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            style={styles.modalSheet}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <GlassCard borderRadius={24} padding={20} intensity={30}>
                {/* Handle */}
                <View style={styles.handle} />

                {selectedTask && (() => {
                  const sc = StatusColors[selectedTask.status] || StatusColors['Todo'];
                  const pc = PRIORITY_COLORS[selectedTask.priority] || PRIORITY_COLORS['Low'];
                  return (
                    <>
                      <View style={styles.detailBadgeRow}>
                        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.badgeText, { color: sc.text }]}>{selectedTask.status}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: pc.bg }]}>
                          <Text style={[styles.badgeText, { color: pc.text }]}>{selectedTask.priority}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: colors.backgroundElement }]}>
                          <Text style={[styles.badgeText, { color: colors.text }]}>{selectedTask.platform}</Text>
                        </View>
                      </View>
                      <Text style={[styles.detailName, { color: colors.text }]}>{selectedTask.name}</Text>
                      {selectedTask.details ? (
                        <Text style={[styles.detailDesc, { color: colors.textSecondary }]}>{selectedTask.details}</Text>
                      ) : null}
                      {selectedTask.result ? (
                        <GlassCard borderRadius={12} padding={12} style={{ marginTop: 12 }}>
                          <Text style={[styles.resultText, { color: colors.textSecondary }]}>{selectedTask.result}</Text>
                        </GlassCard>
                      ) : null}
                      <View style={styles.detailActions}>
                        {selectedTask.platform === 'Instagram' && selectedTask.status === 'Todo' && (
                          <GlowButton
                            label="Post to Instagram"
                            onPress={() => handleConfirmPost(selectedTask.id)}
                            loading={confirmingTaskId === selectedTask.id}
                            colors={['#f09433', '#dc2743', '#bc1888']}
                            icon={<Ionicons name="logo-instagram" size={16} color="#fff" />}
                            style={{ flex: 1 }}
                          />
                        )}
                        {selectedTask.status === 'Todo' && (
                          <GlowButton
                            label="Mark Done"
                            onPress={() => handleUpdateStatus(selectedTask.id, 'Done')}
                            colors={['#059669', '#10b981']}
                            icon={<Ionicons name="checkmark" size={16} color="#fff" />}
                            style={{ flex: 1 }}
                          />
                        )}
                        {selectedTask.details?.startsWith('http') && (
                          <TouchableOpacity
                            style={[styles.linkBtn, { borderColor: colors.border }]}
                            onPress={() => Linking.openURL(selectedTask.details)}
                          >
                            <Ionicons name="open-outline" size={16} color={colors.primary} />
                            <Text style={[styles.linkBtnText, { color: colors.primary }]}>Open</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  );
                })()}
              </GlassCard>
            </TouchableOpacity>
          </MotiView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterScroll: { maxHeight: 56 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '500' },
  taskCard: { flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  leftBar: { width: 3, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
  taskBody: { flex: 1, gap: 6, paddingLeft: 8 },
  taskBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  taskName: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  taskDetails: { fontSize: 12, lineHeight: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  modalSheet: { margin: 12, marginBottom: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginBottom: 16 },
  detailBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  detailName: { fontSize: 18, fontWeight: '700', lineHeight: 24, marginBottom: 8 },
  detailDesc: { fontSize: 14, lineHeight: 20 },
  resultText: { fontSize: 12, lineHeight: 18, fontFamily: 'ui-monospace' },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 20, flexWrap: 'wrap' },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  linkBtnText: { fontSize: 14, fontWeight: '600' },
});
