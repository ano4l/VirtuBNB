import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from '@/src/layout';

const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index: ['sparkles-outline', 'sparkles'], listings: ['business-outline', 'business'], reviews: ['star-outline', 'star'], tasks: ['checkbox-outline', 'checkbox'], more: ['grid-outline', 'grid'],
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <View style={styles.shell}><Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: '#FFFFFF', tabBarInactiveTintColor: '#AAB1AE', tabBarLabelStyle: { fontSize: 11, fontWeight: '800', marginTop: 2 }, tabBarItemStyle: { minHeight: 56, paddingTop: 7 }, tabBarStyle: [styles.tabBar, { bottom: Math.max(TAB_BAR_GAP, insets.bottom) }], tabBarIcon: ({ color, focused }) => <Ionicons name={icons[route.name]?.[focused ? 1 : 0] ?? 'ellipse-outline'} color={color} size={20} /> })}>
    <Tabs.Screen name="index" options={{ title: 'AI' }} />
    <Tabs.Screen name="listings" options={{ title: 'Listings' }} />
    <Tabs.Screen name="reviews" options={{ title: 'Reviews' }} />
    <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
    <Tabs.Screen name="more" options={{ title: 'More' }} />
    <Tabs.Screen name="properties" options={{ href: null }} />
    <Tabs.Screen name="activity" options={{ href: null }} />
  </Tabs></View>;
}

const styles = StyleSheet.create({ shell: { flex: 1, backgroundColor: colors.background }, tabBar: { position: 'absolute', left: 16, right: 16, height: TAB_BAR_HEIGHT, maxWidth: 560, alignSelf: 'center', borderRadius: 23, backgroundColor: colors.ink, borderTopWidth: 0, paddingBottom: 7, paddingTop: 2, shadowColor: '#0B1610', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 } });
