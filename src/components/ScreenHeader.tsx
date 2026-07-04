import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

export default function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      {/* ── Background Glass ── */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={70} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5,6,12,0.92)' }]} />
      )}
      
      {/* ── Subtle animated glow orb in the background ── */}
      <View style={styles.glowContainer} pointerEvents="none">
        <MotiView
          from={{ opacity: 0.3, scale: 0.9, translateX: -20 }}
          animate={{ opacity: 0.6, scale: 1.1, translateX: 10 }}
          transition={{
            type: 'timing',
            duration: 4000,
            loop: true,
            repeatReverse: true,
          }}
          style={styles.glowOrb}
        />
      </View>

      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      
      {/* ── Gradient Bottom Border ── */}
      <LinearGradient
        colors={['transparent', 'rgba(165,180,252,0.3)', 'rgba(192,132,252,0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomBorder}
      />
      
      {/* ── Content ── */}
      <View style={styles.row}>
        <View style={styles.leftContent}>
          {subtitle && (
            <View style={styles.subtitleRow}>
              <Ionicons name="planet" size={12} color="#a5b4fc" style={{ marginRight: 4, marginTop: 1 }} />
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          )}
          
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <MotiView
              from={{ opacity: 0, translateY: 10, rotateZ: '-15deg' }}
              animate={{ opacity: 1, translateY: 0, rotateZ: '0deg' }}
              transition={{ type: 'spring', damping: 14, delay: 200 }}
            >
              <Ionicons name="sparkles" size={20} color="#c084fc" style={{ marginLeft: 6 }} />
            </MotiView>
          </View>
        </View>
        
        {/* Right side actions */}
        {right && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
          >
            {right}
          </MotiView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    overflow: 'hidden',
    zIndex: 10,
    // Add subtle shadow under header
    shadowColor: '#a5b4fc',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  glowOrb: {
    width: 150,
    height: 80,
    borderRadius: 75,
    backgroundColor: 'rgba(99,102,241,0.15)',
    filter: 'blur(30px)',
    transform: [{ translateY: -20 }],
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#a5b4fc', // Indigo 300
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#ffffff',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
});
