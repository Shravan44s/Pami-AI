import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Clipboard,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { apiRequest } from '@/api/client';
import { Colors } from '@/constants/theme';
import GlassCard from '@/components/GlassCard';
import GlowButton from '@/components/GlowButton';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';

interface SearchMemeResult {
  title: string;
  imageUrl: string;
  upvotes: number;
  source: string;
  taskId: string;
  shortId: string;
  alreadyPosted?: boolean;
}

const PRESETS = [
  { label: '💻 Coding', q: 'programming' },
  { label: '🔥 Dank', q: 'dank' },
  { label: '😊 Wholesome', q: 'wholesome' },
  { label: '🏢 Corporate', q: 'corporate' },
  { label: '🚀 Startup', q: 'startup' },
  { label: '🎮 Gaming', q: 'gaming' },
];

const { width } = Dimensions.get('window');

export default function MemesScreen() {
  const colors = Colors.dark;

  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchMemeResult[]>([]);
  const [isBrowsingFeed, setIsBrowsingFeed] = useState(true);
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);

  // Lightbox Modal states
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // AI Meme states
  const [aiConcept, setAiConcept] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiMemeResult, setAiMemeResult] = useState<{
    imageUrl: string;
    caption: string;
    taskId: string;
  } | null>(null);

  // Dynamic trending feed — shows fresh, varied memes as soon as the screen
  // opens, instead of an empty state waiting on a search. The initial mount
  // load stays quiet on failure (no blocking alert) — an empty state is
  // enough; refreshes the user explicitly triggers still surface errors.
  const fetchTrendingFeed = async (options: { silentSpinner?: boolean; silentError?: boolean } = {}) => {
    if (!options.silentSpinner) setLoadingSearch(true);
    setIsBrowsingFeed(true);
    try {
      const res = await apiRequest('trendingFeed', 'GET', null);
      setSearchResults(res || []);
    } catch (err: any) {
      if (!options.silentError) alert(`Failed to load trending memes: ${err.message}`);
    } finally {
      setLoadingSearch(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTrendingFeed({ silentError: true }); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.selectionAsync();
    if (isBrowsingFeed) fetchTrendingFeed({ silentSpinner: true });
    else handleSearch(undefined, true);
  };

  const handleSearch = async (queryOverride?: string, silent = false) => {
    const q = queryOverride !== undefined ? queryOverride : searchQuery;
    if (!q.trim()) { fetchTrendingFeed(); return; }

    if (!silent) { setLoadingSearch(true); setSearchResults([]); }
    setIsBrowsingFeed(false);
    try {
      const res = await apiRequest(`searchMemes&q=${encodeURIComponent(q)}`, 'GET', null);
      setSearchResults(res || []);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setLoadingSearch(false);
      setRefreshing(false);
    }
  };

  const handlePresetSelect = (q: string) => {
    Haptics.selectionAsync();
    setSearchQuery(q);
    handleSearch(q);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchTrendingFeed();
  };

  const handleGenerateAIMeme = async () => {
    if (!aiConcept.trim()) return;
    setGeneratingAi(true);
    setAiMemeResult(null);
    try {
      const res = await apiRequest('generateAIMeme', 'POST', { concept: aiConcept });
      setAiMemeResult(res);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleConfirmPost = async (taskId: string) => {
    setConfirmingTaskId(taskId);
    try {
      await apiRequest('confirmPost', 'POST', { taskId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert('🚀 Reel published to Instagram successfully!');
      setSearchResults(prev => prev.filter(item => item.taskId !== taskId));
      if (aiMemeResult?.taskId === taskId) {
        setAiMemeResult(null);
      }
    } catch (err: any) {
      alert(`Failed to publish: ${err.message}`);
    } finally {
      setConfirmingTaskId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Haptics.selectionAsync();
    alert('📋 Caption copied to clipboard!');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Memes" subtitle="Trending Now" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >

        {/* Input Bar */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={[styles.searchInput, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="Search topic (e.g. marriage, coding, cats)..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); if (!t.trim()) clearSearch(); }}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={() => { Haptics.selectionAsync(); handleSearch(); }}
            disabled={loadingSearch}
          >
            {loadingSearch ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Advanced Filters/Topic Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetScroll}
          contentContainerStyle={styles.presetContainer}
        >
          {PRESETS.map((p) => {
            const active = searchQuery === p.q;
            return (
              <TouchableOpacity key={p.q} onPress={() => handlePresetSelect(p.q)} activeOpacity={0.75}>
                <MotiView
                  animate={{ scale: active ? 1.06 : 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 300 }}
                >
                  {active ? (
                    <LinearGradient
                      colors={['#6366f1', '#a855f7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.chip}
                    >
                      <Text style={[styles.chipText, { color: '#fff' }]}>{p.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chip, {
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.10)',
                    }]}>
                      <Text style={[styles.chipText, { color: colors.textSecondary }]}>{p.label}</Text>
                    </View>
                  )}
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Loading Skeletons */}
        {loadingSearch && (
          <View style={styles.skeletonContainer}>
            {[1, 2].map((s) => (
              <MotiView
                key={s}
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.8 }}
                transition={{ type: 'timing', duration: 800, loop: true, repeatReverse: true }}
              >
                <GlassCard borderRadius={18} padding={0} style={styles.skeletonCard}>
                  <View style={[styles.skeletonHeader, { backgroundColor: colors.backgroundElement }]} />
                  <View style={[styles.skeletonImage, { backgroundColor: colors.backgroundElement }]} />
                  <View style={styles.skeletonFooter}>
                    <View style={[styles.skeletonText, { backgroundColor: colors.backgroundElement, width: '70%' }]} />
                    <View style={[styles.skeletonText, { backgroundColor: colors.backgroundElement, width: '40%' }]} />
                  </View>
                </GlassCard>
              </MotiView>
            ))}
          </View>
        )}

        {/* Search Results / Trending Feed */}
        {searchResults.length > 0 && !loadingSearch && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: colors.textSecondary }]}>
              {isBrowsingFeed ? `Trending across ${new Set(searchResults.map(m => m.source)).size} categories` : `Found ${searchResults.length} memes`}
            </Text>
            {searchResults.map((meme, i) => (
              <MotiView
                key={meme.taskId}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 24, delay: i * 80 }}
              >
                <GlassCard borderRadius={20} padding={0} style={styles.memeCard} glowColor="rgba(99,102,241,0.25)">

                  {/* Header mimicking Reddit/IG poster details */}
                  <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{meme.source.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.authorText, { color: colors.text }]}>{meme.source}</Text>
                      <Text style={[styles.subredditSubText, { color: colors.textSecondary }]}>Trending now</Text>
                    </View>
                    {meme.alreadyPosted && (
                      <View style={styles.postedBadge}>
                        <Ionicons name="checkmark-circle" size={11} color="#34d399" />
                        <Text style={styles.postedBadgeText}>Posted recently</Text>
                      </View>
                    )}
                  </View>

                  {/* High-performance Cached Image */}
                  <TouchableOpacity onPress={() => setLightboxUrl(meme.imageUrl)}>
                    <Image
                      source={meme.imageUrl}
                      style={styles.memeImage}
                      contentFit="contain"
                      transition={250}
                    />
                    <View style={styles.tapIndicator}>
                      <Ionicons name="expand" size={14} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.tapText}>Tap to Expand</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Info and Actions Footer */}
                  <View style={styles.memeInfo}>
                    <Text style={[styles.memeTitle, { color: colors.text }]}>{meme.title}</Text>

                    <View style={styles.actionsRow}>
                      <View style={styles.voteContainer}>
                        <Ionicons name="heart" size={16} color="#ef4444" />
                        <Text style={[styles.memeMeta, { color: colors.textSecondary }]}>
                          {meme.upvotes.toLocaleString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => copyToClipboard(`${meme.title} 😂\n\n#memes #funny #viral`)}
                      >
                        <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <GlowButton
                      label={confirmingTaskId === meme.taskId ? '' : `Post as Reel (${meme.shortId})`}
                      onPress={() => handleConfirmPost(meme.taskId)}
                      loading={confirmingTaskId === meme.taskId}
                      colors={['#f09433', '#dc2743', '#bc1888']}
                      icon={<Ionicons name="logo-instagram" size={16} color="#fff" />}
                    />
                  </View>
                </GlassCard>
              </MotiView>
            ))}
          </View>
        )}

        {/* AI Meme Generator Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Meme Generator</Text>
        <GlassCard borderRadius={20} padding={16} style={styles.aiGeneratorCard} glowColor="rgba(168,85,247,0.25)">
          <Text style={[styles.aiLabel, { color: colors.textSecondary }]}>Enter a concept or joke:</Text>
          <TextInput
            style={[styles.aiInput, {
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.10)',
              color: colors.text
            }]}
            multiline
            numberOfLines={3}
            placeholder="e.g. A programmer debugging at 3am when they realize they forgot a semicolon..."
            placeholderTextColor={colors.textSecondary}
            value={aiConcept}
            onChangeText={setAiConcept}
          />
          <GlowButton
            label="Generate AI Meme"
            onPress={handleGenerateAIMeme}
            loading={generatingAi}
            disabled={!aiConcept.trim()}
            colors={['#7c3aed', '#a855f7', '#d946ef']}
            icon={<Ionicons name="sparkles" size={16} color="#fff" />}
            style={{ marginTop: 4 }}
          />
        </GlassCard>

        {/* AI Meme Result Preview */}
        {aiMemeResult && (
          <GlassCard borderRadius={20} padding={0} style={[styles.memeCard, { marginTop: 16 }]} glowColor="rgba(192,132,252,0.30)">
            <Text style={[styles.previewLabel, { color: colors.secondary }]}>✨ Generated AI Meme Preview</Text>
            
            <TouchableOpacity onPress={() => setLightboxUrl(aiMemeResult.imageUrl)}>
              <Image
                source={aiMemeResult.imageUrl}
                style={styles.memeImage}
                contentFit="contain"
                transition={250}
              />
            </TouchableOpacity>

            <View style={styles.memeInfo}>
              <Text style={[styles.aiCaption, { color: colors.text }]}>{aiMemeResult.caption}</Text>
              
              <View style={[styles.actionsRow, { marginBottom: 12 }]}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => copyToClipboard(aiMemeResult.caption)}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Copy Caption</Text>
                </TouchableOpacity>
              </View>

              <GlowButton
                label={confirmingTaskId === aiMemeResult.taskId ? '' : 'Post as Reel on Instagram'}
                onPress={() => handleConfirmPost(aiMemeResult.taskId)}
                loading={confirmingTaskId === aiMemeResult.taskId}
                colors={['#f09433', '#dc2743', '#bc1888']}
                icon={<Ionicons name="logo-instagram" size={16} color="#fff" />}
              />
            </View>
          </GlassCard>
        )}

      </ScrollView>

      {/* Advanced Full Screen Lightbox Modal */}
      <Modal
        visible={lightboxUrl !== null}
        transparent={true}
        animationType="none"
        onRequestClose={() => setLightboxUrl(null)}
      >
        <TouchableOpacity
          style={styles.lightboxOverlay}
          activeOpacity={1}
          onPress={() => setLightboxUrl(null)}
        >
          {lightboxUrl && (
            <MotiView
              from={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              style={styles.lightboxContent}
            >
              <Image
                source={lightboxUrl}
                style={styles.lightboxImage}
                contentFit="contain"
              />
              <TouchableOpacity
                style={styles.closeLightboxBtn}
                onPress={() => setLightboxUrl(null)}
              >
                {Platform.OS === 'ios' ? (
                  <BlurView intensity={40} tint="dark" style={styles.closeBtnBlur}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </BlurView>
                ) : (
                  <View style={[styles.closeBtnBlur, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Ionicons name="close" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          )}
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetScroll: {
    marginBottom: 20,
  },
  presetContainer: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  skeletonContainer: {
    gap: 16,
    marginBottom: 20,
  },
  skeletonCard: {
    paddingBottom: 16,
    overflow: 'hidden',
  },
  skeletonHeader: {
    height: 50,
    width: '100%',
    opacity: 0.5,
  },
  skeletonImage: {
    height: 250,
    width: '100%',
    opacity: 0.3,
  },
  skeletonFooter: {
    padding: 16,
    gap: 8,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
    opacity: 0.4,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  memeCard: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  postedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  postedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
  },
  authorText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  subredditSubText: {
    fontSize: 10,
    marginTop: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: 12,
    textTransform: 'uppercase',
  },
  memeImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#000',
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  memeInfo: {
    padding: 16,
  },
  memeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  memeMeta: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  aiGeneratorCard: {
    gap: 12,
    marginBottom: 24,
  },
  aiLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  aiInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 80,
  },

  aiCaption: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: width * 0.95,
    height: '80%',
  },
  closeLightboxBtn: {
    position: 'absolute',
    top: 44,
    right: 20,
    borderRadius: 22,
    overflow: 'hidden',
  },
  closeBtnBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
