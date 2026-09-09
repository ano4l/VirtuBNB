import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, Screen } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';
import { colors } from '@/src/theme';
export default function MessagesScreen() {
  const { conversations, properties } = useAppState();
  return <Screen><PageHeader title="Messages" subtitle="Guest conversations" /><View style={styles.list}>{conversations.map((c) => { const property = properties.find((p) => p.id === c.propertyId); return <Pressable key={c.id} accessibilityRole="button" onPress={() => router.push(`/conversation/${c.id}`)} style={({ pressed }) => [styles.row, pressed && { opacity: .62 }]}><View style={styles.avatar}><Text style={styles.initials}>{c.guest.split(' ').map((x) => x[0]).join('')}</Text></View><View style={styles.copy}><View style={styles.top}><Text style={styles.name}>{c.guest}</Text><Text style={styles.time}>{c.time}</Text></View><Text style={styles.property}>{property?.name}</Text><Text numberOfLines={1} style={styles.preview}>{c.preview}</Text></View>{c.unread && <View style={styles.unread} />}</Pressable>; })}</View></Screen>;
}
const styles = StyleSheet.create({ list: { marginTop: 12 }, row: { minHeight: 92, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 13 }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, initials: { color: colors.greenDark, fontSize: 13, fontWeight: '900' }, copy: { flex: 1 }, top: { flexDirection: 'row', justifyContent: 'space-between' }, name: { color: colors.ink, fontSize: 15, fontWeight: '800' }, time: { color: colors.inkFaint, fontSize: 10 }, property: { color: colors.inkMuted, fontSize: 11, marginTop: 3 }, preview: { color: colors.inkMuted, fontSize: 12, marginTop: 7 }, unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green } });
