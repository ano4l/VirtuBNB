import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppStateProvider } from '@/src/state/AppState';
import { colors } from '@/src/theme';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Onboarding } from '@/src/components/Onboarding';
import { useAppState } from '@/src/state/AppState';
import { WebPwa } from '@/src/components/WebPwa';

function AppNavigator() {
  const { onboardingComplete } = useAppState();
  if (!onboardingComplete) return <Onboarding />;
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="approvals" options={{ title: 'Review change', presentation: 'modal' }} />
    <Stack.Screen name="connect" options={{ title: 'Workspace connection' }} />
    <Stack.Screen name="property/[id]" options={{ title: 'Listing' }} />
  </Stack></>;
}

export default function RootLayout() {
  return <SafeAreaProvider initialMetrics={initialWindowMetrics}><AppStateProvider><WebPwa /><AppNavigator /></AppStateProvider></SafeAreaProvider>;
}
