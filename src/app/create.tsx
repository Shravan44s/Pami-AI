import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';

import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { apiRequest } from '@/api/client';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import ScreenHeader from '@/components/ScreenHeader';

type FormType = 'task' | 'repo' | 'issue' | 'aiart';

const FORM_TABS: { key: FormType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'task', label: 'Task', icon: 'document-text' },
  { key: 'repo', label: 'Repo', icon: 'git-branch' },
  { key: 'issue', label: 'Issue', icon: 'bug' },
  { key: 'aiart', label: 'AI Art', icon: 'color-palette' },
];

export default function CreateScreen() {
  const colors = Colors.dark;

  const [activeForm, setActiveForm] = useState<FormType>('task');
  const [loading, setLoading] = useState(false);

  // Form states - Notion Task
  const [taskName, setTaskName] = useState('');
  const [taskPlatform, setTaskPlatform] = useState<'General' | 'GitHub' | 'Instagram' | 'VSCode'>('General');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDetails, setTaskDetails] = useState('');

  // Form states - GitHub Repo
  const [repoName, setRepoName] = useState('');
  const [repoDesc, setRepoDesc] = useState('');
  const [repoPrivate, setRepoPrivate] = useState(true);

  // Form states - GitHub Issue
  const [issueOwner, setIssueOwner] = useState('');
  const [issueRepo, setIssueRepo] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueBody, setIssueBody] = useState('');

  // Form states - AI Art
  const [artPrompt, setArtPrompt] = useState('');

  const resetForms = () => {
    setTaskName('');
    setTaskDetails('');
    setRepoName('');
    setRepoDesc('');
    setIssueOwner('');
    setIssueRepo('');
    setIssueTitle('');
    setIssueBody('');
    setArtPrompt('');
  };

  const handleCreateTask = async () => {
    if (!taskName.trim()) return;
    setLoading(true);
    try {
      await apiRequest('createTask', 'POST', {
        name: taskName,
        platform: taskPlatform,
        priority: taskPriority,
        details: taskDetails,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert('📝 Notion task created successfully!');
      resetForms();
    } catch (err: any) {
      alert(`Failed to create task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!repoName.trim()) return;
    setLoading(true);
    try {
      const res = await apiRequest('createRepo', 'POST', {
        name: repoName,
        description: repoDesc,
        isPrivate: repoPrivate,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert(`🐙 GitHub Repository created!\nUrl: ${res.url}`);
      resetForms();
    } catch (err: any) {
      alert(`Failed to create repo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!issueOwner.trim() || !issueRepo.trim() || !issueTitle.trim()) return;
    setLoading(true);
    try {
      const res = await apiRequest('createIssue', 'POST', {
        owner: issueOwner,
        repo: issueRepo,
        title: issueTitle,
        body: issueBody,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert(`🐙 GitHub Issue #${res.number} created!`);
      resetForms();
    } catch (err: any) {
      alert(`Failed to create issue: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArt = async () => {
    if (!artPrompt.trim()) return;
    setLoading(true);
    try {
      await apiRequest('createTask', 'POST', {
        name: artPrompt,
        platform: 'Instagram',
        priority: 'Medium',
        details: artPrompt, // Details will prompt image generation, converted to a Reel on confirm
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert(`🎨 Notion Instagram task created for AI Art!\nTask Title: "${artPrompt}"\n\nIt'll be rendered as a video Reel when you confirm it on the Tasks tab.`);
      resetForms();
    } catch (err: any) {
      alert(`Art task creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create" subtitle="New Automation" />

      {/* ── Form Type Selector ── */}
      <View style={styles.gridNav}>
        {FORM_TABS.map((form) => {
          const active = activeForm === form.key;
          return (
            <TouchableOpacity
              key={form.key}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveForm(form.key);
                resetForms();
              }}
              style={{ flex: 1 }}
            >
              <MotiView
                animate={{ scale: active ? 1.04 : 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              >
                {active ? (
                  <LinearGradient
                    colors={['#6366f1', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.navBtn}
                  >
                    <Ionicons name={form.icon} size={20} color="#fff" />
                    <Text style={[styles.navBtnText, { color: '#fff' }]}>{form.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.navBtn, { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' }]}>
                    <Ionicons name={form.icon} size={20} color={colors.textSecondary} />
                    <Text style={[styles.navBtnText, { color: colors.textSecondary }]}>{form.label}</Text>
                  </View>
                )}
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notion Task Form */}
        {activeForm === 'task' && (
          <MotiView key="task" from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 22 }}>
            <GlassCard borderRadius={20} padding={18} style={{ gap: 4 }} glowColor="rgba(99,102,241,0.25)">
              <Text style={[styles.formTitle, { color: colors.text }]}>Add Notion Task</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Task Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border, color: colors.text }]}
                placeholder="Clean my workspace / Optimize builds..."
                placeholderTextColor={colors.textSecondary}
                value={taskName}
                onChangeText={setTaskName}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Platform</Text>
              <View style={styles.pickerRow}>
                {(['General', 'GitHub', 'Instagram', 'VSCode'] as const).map(platform => (
                  <TouchableOpacity
                    key={platform}
                    style={[
                      styles.pickerBtn,
                      { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border },
                      taskPlatform === platform && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setTaskPlatform(platform)}
                  >
                    <Text style={[styles.pickerBtnText, { color: taskPlatform === platform ? '#fff' : colors.text }]}>
                      {platform}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
              <View style={styles.pickerRow}>
                {(['Low', 'Medium', 'High'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.pickerBtn,
                      { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border },
                      taskPriority === priority && {
                        backgroundColor:
                          priority === 'High' ? colors.error :
                          priority === 'Medium' ? colors.warning : colors.success,
                        borderColor: 'transparent'
                      }
                    ]}
                    onPress={() => setTaskPriority(priority)}
                  >
                    <Text style={[styles.pickerBtnText, { color: taskPriority === priority ? '#fff' : colors.text }]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Details (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, {
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderColor: colors.border,
                  color: colors.text
                }]}
                multiline
                numberOfLines={4}
                placeholder="Provide extra details, video prompts, or markdown configs here..."
                placeholderTextColor={colors.textSecondary}
                value={taskDetails}
                onChangeText={setTaskDetails}
              />

              <GlowButton
                label="Create Task"
                onPress={handleCreateTask}
                loading={loading}
                disabled={!taskName.trim()}
                icon={<Ionicons name="add-circle-outline" size={16} color="#fff" />}
                style={{ marginTop: 10 }}
              />
            </GlassCard>
          </MotiView>
        )}

        {/* GitHub Repo Form */}
        {activeForm === 'repo' && (
          <MotiView key="repo" from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 22 }}>
            <GlassCard borderRadius={20} padding={18} style={{ gap: 4 }} glowColor="rgba(99,102,241,0.25)">
              <Text style={[styles.formTitle, { color: colors.text }]}>New GitHub Repository</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Repo Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border, color: colors.text }]}
                placeholder="my-new-automation-system"
                placeholderTextColor={colors.textSecondary}
                value={repoName}
                onChangeText={setRepoName}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border, color: colors.text }]}
                placeholder="Repository to automate workflow schedules..."
                placeholderTextColor={colors.textSecondary}
                value={repoDesc}
                onChangeText={setRepoDesc}
              />

              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Private Repository</Text>
                  <Text style={[styles.switchSub, { color: colors.textSecondary }]}>Restrict repository access</Text>
                </View>
                <Switch
                  value={repoPrivate}
                  onValueChange={setRepoPrivate}
                  trackColor={{ false: '#767577', true: colors.primary }}
                />
              </View>

              <GlowButton
                label="Create Repository"
                onPress={handleCreateRepo}
                loading={loading}
                disabled={!repoName.trim()}
                icon={<Ionicons name="git-branch-outline" size={16} color="#fff" />}
              />
            </GlassCard>
          </MotiView>
        )}

        {/* GitHub Issue Form */}
        {activeForm === 'issue' && (
          <MotiView key="issue" from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 22 }}>
            <GlassCard borderRadius={20} padding={18} style={{ gap: 4 }} glowColor="rgba(99,102,241,0.25)">
              <Text style={[styles.formTitle, { color: colors.text }]}>New GitHub Issue</Text>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Owner *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border, color: colors.text }]}
                    placeholder="Shravan44s"
                    placeholderTextColor={colors.textSecondary}
                    value={issueOwner}
                    onChangeText={setIssueOwner}
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Repo Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border, color: colors.text }]}
                    placeholder="MCP"
                    placeholderTextColor={colors.textSecondary}
                    value={issueRepo}
                    onChangeText={setIssueRepo}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Issue Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border, color: colors.text }]}
                placeholder="Fix SQLite token metrics reporting error..."
                placeholderTextColor={colors.textSecondary}
                value={issueTitle}
                onChangeText={setIssueTitle}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Description / Details</Text>
              <TextInput
                style={[styles.input, styles.textArea, {
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderColor: colors.border,
                  color: colors.text
                }]}
                multiline
                numberOfLines={4}
                placeholder="Steps to reproduce, error logs, or requirements..."
                placeholderTextColor={colors.textSecondary}
                value={issueBody}
                onChangeText={setIssueBody}
              />

              <GlowButton
                label="Create Issue"
                onPress={handleCreateIssue}
                loading={loading}
                disabled={!issueOwner.trim() || !issueRepo.trim() || !issueTitle.trim()}
                icon={<Ionicons name="bug-outline" size={16} color="#fff" />}
                style={{ marginTop: 10 }}
              />
            </GlassCard>
          </MotiView>
        )}

        {/* AI Art Form */}
        {activeForm === 'aiart' && (
          <MotiView key="aiart" from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', damping: 22 }}>
            <GlassCard borderRadius={20} padding={18} style={{ gap: 4 }} glowColor="rgba(168,85,247,0.28)">
              <Text style={[styles.formTitle, { color: colors.text }]}>Generate AI Art Post</Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Prompt Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea, {
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderColor: colors.border,
                  color: colors.text
                }]}
                multiline
                numberOfLines={3}
                placeholder="A beautiful futuristic neon cyberpunk city with flying cars, highly detailed, photorealistic 8k..."
                placeholderTextColor={colors.textSecondary}
                value={artPrompt}
                onChangeText={setArtPrompt}
              />

              <GlowButton
                label="Generate Art Task"
                onPress={handleGenerateArt}
                loading={loading}
                disabled={!artPrompt.trim()}
                colors={['#7c3aed', '#a855f7', '#d946ef']}
                icon={<Ionicons name="sparkles" size={16} color="#fff" />}
                style={{ marginTop: 10 }}
              />
            </GlassCard>
          </MotiView>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
  navBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    gap: 4,
  },
  navBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  pickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
