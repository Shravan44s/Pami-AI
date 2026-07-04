import React from 'react';
import { StyleSheet, View, useColorScheme, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== 'light';

  const gradientColors = isDark ? Gradients.background : Gradients.backgroundLight;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors as unknown as [string, string, ...string[]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Subtle mid-screen orb glow */}
      {isDark && (
        <>
          <View style={styles.orbTopLeft} />
          <View style={styles.orbBottomRight} />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(99,102,241,0.13)',
    // Soft blur approximation using multiple layers not available without Skia,
    // so we use opacity + large borderRadius glow
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: 60,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(168,85,247,0.10)',
  },
});
