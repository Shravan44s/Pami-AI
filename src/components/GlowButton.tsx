import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  colors?: readonly [string, string, ...string[]];
  icon?: React.ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function GlowButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  colors = ['#6366f1', '#8b5cf6', '#a855f7'],
  icon,
  style,
  size = 'md',
}: GlowButtonProps) {
  const [pressed, setPressed] = React.useState(false);

  const height = size === 'sm' ? 40 : size === 'lg' ? 58 : 50;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;
  const paddingH = size === 'sm' ? 16 : size === 'lg' ? 28 : 20;

  return (
    <MotiView
      animate={{ scale: pressed ? 0.96 : 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 350 }}
      style={[styles.wrapper, style]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled || loading}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={onPress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={disabled ? ['#4b5563', '#6b7280'] : (colors as [string, string, ...string[]])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { height, paddingHorizontal: paddingH }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              {icon}
              <Text style={[styles.label, { fontSize }]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    // Glow shadow
    shadowColor: '#818cf8',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
