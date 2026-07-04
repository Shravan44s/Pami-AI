import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  useColorScheme,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Appearance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import GradientBackground from '@/components/GradientBackground';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const iconFont = require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf');
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(
    document.createTextNode(`
      @font-face {
        font-family: 'Ionicons';
        src: url(${iconFont}) format('truetype');
      }
    `)
  );
  document.head.appendChild(style);
}

SplashScreen.preventAutoHideAsync();

// Force dark mode handled in components

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  { name: 'index',    icon: 'grid-outline',             iconFocused: 'grid',                  label: 'Home'     },
  { name: 'tasks',    icon: 'list-circle-outline',          iconFocused: 'list-circle',            label: 'Tasks'    },
  { name: 'memes',    icon: 'happy-outline',                iconFocused: 'happy',                  label: 'Memes'    },
  { name: 'create',   icon: 'add-circle-outline',           iconFocused: 'add-circle',             label: 'Create'   },
  { name: 'chat',     icon: 'chatbubble-ellipses-outline',  iconFocused: 'chatbubble-ellipses',    label: 'AI Chat'  },
  { name: 'settings', icon: 'settings-outline',             iconFocused: 'settings',               label: 'Settings' },
] as const;

// ─── Apple Floating Pill Tab Bar ─────────────────────────────────────────────
function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter(r =>
    TABS.some(t => t.name === r.name)
  );

  return (
    <View
      style={[pill.wrapper, { bottom: Math.max(insets.bottom, 16) + 4 }]}
      pointerEvents="box-none"
    >
      <View style={pill.pillOuter}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={75}
            tint="systemChromeMaterialDark"
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(12,13,26,0.94)' }]} />
        )}
        {/* Glass sheen */}
        <View style={[StyleSheet.absoluteFillObject, pill.sheen]} />
        {/* Top highlight */}
        <View style={pill.topLine} />

        <View style={pill.row}>
          {visibleRoutes.map((route) => {
            const tabConfig = TABS.find(t => t.name === route.name);
            if (!tabConfig) return null;
            const routeIndex = state.routes.findIndex(r => r.key === route.key);
            const isFocused = state.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.7}
                style={pill.tab}
                accessibilityLabel={tabConfig.label}
                accessibilityRole="tab"
              >
                {/* Active indicator */}
                <MotiView
                  animate={{ opacity: isFocused ? 1 : 0, scale: isFocused ? 1 : 0.5 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  style={pill.activeBg}
                />
                {/* Icon */}
                <MotiView
                  animate={{ scale: isFocused ? 1.12 : 1, translateY: isFocused ? -1 : 0 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                >
                  <Ionicons
                    name={(isFocused ? tabConfig.iconFocused : tabConfig.icon) as any}
                    size={20}
                    color={isFocused ? '#ffffff' : 'rgba(255,255,255,0.45)'}
                  />
                </MotiView>
                {/* Label — only on active */}
                <MotiView
                  animate={{ opacity: 1, translateY: isFocused ? 0 : 2 }}
                  transition={{ type: 'spring', damping: 22 }}
                >
                  <Text style={[pill.label, { color: isFocused ? '#ffffff' : 'rgba(255,255,255,0.45)' }]}>
                    {tabConfig.label}
                  </Text>
                </MotiView>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}



// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function TabLayout() {
  const [loaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <GradientBackground>
        <Tabs
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="tasks" />
          <Tabs.Screen name="memes" />
          <Tabs.Screen name="create" />
          <Tabs.Screen name="chat" />
          <Tabs.Screen name="settings" />
          <Tabs.Screen name="explore" options={{ href: null }} />
        </Tabs>
      </GradientBackground>
    </ThemeProvider>
  );
}

// ─── Pill Styles ──────────────────────────────────────────────────────────────
const pill = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
    zIndex: 100,
  },
  pillOuter: {
    flexDirection: 'row',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  sheen: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 40,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 32,
    minWidth: 50,
    gap: 2,
  },
  activeBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(165,180,252,0.18)',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});


