import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import GlassCard from './GlassCard';

/** A single pulsing placeholder block — the shimmer pattern from the Memes screen, extracted for reuse. */
export function SkeletonBlock({
  width = '100%',
  height = 14,
  borderRadius = 6,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.8 }}
      transition={{ type: 'timing', duration: 800, loop: true, repeatReverse: true }}
      style={[
        { width, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.08)' },
        style,
      ]}
    />
  );
}

/** A glass-card row skeleton — matches list-item card layout used on Tasks/Memes. */
export function SkeletonRow({ style }: { style?: ViewStyle }) {
  return (
    <GlassCard borderRadius={18} padding={14} style={style ? [styles.row, style] : styles.row}>
      <SkeletonBlock width={40} height={40} borderRadius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBlock width="60%" height={12} />
        <SkeletonBlock width="90%" height={14} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
