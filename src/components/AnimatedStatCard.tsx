import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import GlassCard from './GlassCard';

interface AnimatedStatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  delay?: number;
  glowColor?: string;
  onPress?: () => void;
}

export default function AnimatedStatCard({
  icon,
  value,
  label,
  delay = 0,
  glowColor = 'rgba(129,140,248,0.5)',
  onPress,
}: AnimatedStatCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 24, scale: 0.88 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 22,
        stiffness: 260,
        delay,
      }}
      style={styles.motiWrapper}
    >
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.touchable}>
        <GlassCard
          style={styles.card}
          glowColor={glowColor}
          borderRadius={18}
          padding={16}
        >
          <View style={styles.inner}>
            <View style={styles.iconRow}>{icon}</View>
            <Text style={styles.value}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  motiWrapper: {
    width: '48%',
  },
  touchable: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  card: {
    width: '100%',
  },
  inner: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconRow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(129,140,248,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    color: 'rgba(248,250,252,0.55)',
    marginTop: 3,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
