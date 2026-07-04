import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  glowColor?: string;
  borderRadius?: number;
  padding?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 18,
  glowColor,
  borderRadius = 20,
  padding = 16,
}: GlassCardProps) {
  const isIOS = Platform.OS === 'ios';

  if (isIOS) {
    return (
      <View
        style={[
          styles.wrapper,
          { borderRadius },
          glowColor && {
            shadowColor: glowColor,
            shadowOpacity: 0.55,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 0 },
          },
          style,
        ]}
      >
        <BlurView
          intensity={intensity}
          tint="dark"
          style={[styles.blur, { borderRadius }]}
        >
          {/* Translucent overlay */}
          <View style={[styles.overlay, { borderRadius, padding }]}>
            {/* Top highlight streak */}
            <View style={[styles.topHighlight, { borderRadius: borderRadius - 1 }]} />
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  // Android / Web fallback — flat dark card
  return (
    <View
      style={[
        styles.fallback,
        { borderRadius, padding },
        glowColor && {
          shadowColor: glowColor,
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    // iOS-only shadow glow
    elevation: 0,
  },
  blur: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  fallback: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
});
