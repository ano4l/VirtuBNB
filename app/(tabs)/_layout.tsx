import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Orb } from '@/src/components/ui';
import { colors } from '@/src/theme';
import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from '@/src/layout';

const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = { index: ['home-outline', 'home'], bookings: ['calendar-clear-outline', 'calendar-clear'], messages: ['chatbubble-outline', 'chatbubble'], listings: ['business-outline', 'business'] };

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <View style={styles.shell}><Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarHideOnKeyboard: true, tabBarShowLabel: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.inkFaint, tabBarItemStyle: styles.item, tabBarStyle: [styles.tabBar, { bottom: Math.max(TAB_BAR_GAP, insets.bottom) }], tabBarIcon: ({ color, focused }) => route.name === 'ai' ? <Orb size={48} busy={focused} /> : <Ionicons name={icons[route.name]?.[focused ? 1 : 0] ?? 'ellipse-outline'} color={color} size={21} /> })}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} /><Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
    <Tabs.Screen name="ai" options={{ title: 'Virtu AI' }} />
    <Tabs.Screen name="messages" options={{ title: 'Messages' }} /><Tabs.Screen name="listings" options={{ title: 'Listings' }} />
    {['more','reviews','tasks','properties','activity'].map((name) => <Tabs.Screen key={name} name={name} options={{ href: null }} />)}
  </Tabs></View>;
}
const styles = StyleSheet.create({ shell: { flex: 1, backgroundColor: colors.background }, tabBar: { position: 'absolute', left: 16, right: 16, height: TAB_BAR_HEIGHT, maxWidth: 520, alignSelf: 'center', borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.94)', borderTopWidth: 0, paddingHorizontal: 8, shadowColor: '#171426', shadowOpacity: .14, shadowRadius: 24, shadowOffset: { width: 0, height: 9 }, elevation: 10 }, item: { minHeight: 58 } });
