import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { apiRequest } from '@/api/client';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

type FormType = 'task' | 'repo' | 'issue' | 'aiart';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = true;
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
  const [generatedArtUrl, setGeneratedArtUrl] = useState<string | null>(null);

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
    setGeneratedArtUrl(null);
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
    setGeneratedArtUrl(null);
    try {
      // Re-use confirm/aiart logic. Let's make an API call to a prompt enhancer on the backend
      const res = await apiRequest('createTask', 'POST', {
        name: artPrompt,
        platform: 'Instagram',
        priority: 'Medium',
        details: artPrompt, // Details will prompt image generation on run or directly
      });
      alert(`🎨 Notion Instagram task created for AI Art!\nTask Title: "${artPrompt}"`);
      resetForms();
    } catch (err: any) {
      alert(`Art task creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>

      {/* Category selector grid */}
      <View style={styles.gridNav}>
        {(['task', 'repo', 'issue', 'aiart'] as const).map(form => (
          <TouchableOpacity
            key={form}
            style={[
              styles.navBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              activeForm === form && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
            ]}
            onPress={() => {
              setActiveForm(form);
              resetForms();
            }}
          >
            <Ionicons
              name={
                form === 'task' ? 'document-text' :
                form === 'repo' ? 'git-branch' :
                form === 'issue' ? 'bug' : 'color-palette'
              }
              size={20}
              color={activeForm === form ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.navBtnText,
                { color: activeForm === form ? colors.primary : colors.textSecondary }
              ]}
            >
              {
                form === 'task' ? 'Task' :
                form === 'repo' ? 'Repo' :
                form === 'issue' ? 'Issue' : 'AI Art'
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notion Task Form */}
        {activeForm === 'task' && (
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Add Notion Task</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Task Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
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
                    { backgroundColor: colors.card, borderColor: colors.border },
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
                    { backgroundColor: colors.card, borderColor: colors.border },
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
                backgroundColor: colors.card,
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

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateTask}
              disabled={loading || !taskName.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Create Task</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* GitHub Repo Form */}
        {activeForm === 'repo' && (
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>New GitHub Repository</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Repo Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="my-new-automation-system"
              placeholderTextColor={colors.textSecondary}
              value={repoName}
              onChangeText={setRepoName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
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

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateRepo}
              disabled={loading || !repoName.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Create Repository</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* GitHub Issue Form */}
        {activeForm === 'issue' && (
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>New GitHub Issue</Text>

            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Owner *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="Shravan44s"
                  placeholderTextColor={colors.textSecondary}
                  value={issueOwner}
                  onChangeText={setIssueOwner}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Repo Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="MCP"
                  placeholderTextColor={colors.textSecondary}
                  value={issueRepo}
                  onChangeText={setIssueRepo}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Issue Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Fix SQLite token metrics reporting error..."
              placeholderTextColor={colors.textSecondary}
              value={issueTitle}
              onChangeText={setIssueTitle}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Description / Details</Text>
            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: colors.card,
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

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateIssue}
              disabled={loading || !issueOwner.trim() || !issueRepo.trim() || !issueTitle.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Create Issue</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* AI Art Form */}
        {activeForm === 'aiart' && (
          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Generate AI Art Post</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Prompt Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, {
                backgroundColor: colors.card,
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

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.secondary }]}
              onPress={handleGenerateArt}
              disabled={loading || !artPrompt.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Generate Art Task</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    padding: 12,
    gap: 8,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  navBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    gap: 6,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  pickerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  pickerBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  submitBtn: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
