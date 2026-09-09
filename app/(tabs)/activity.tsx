import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eyebrow, Screen, ScreenTitle } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';
import { ActivityKind } from '@/src/models';
import { colors, spacing } from '@/src/theme';

const kindRead: Record<ActivityKind, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; background: string }> = {
  user: { icon: 'person-outline', label: 'Your action', color: colors.inkMuted, background: colors.neutralSoft },
  automation: { icon: 'flash-outline', label: 'VirtuHost', color: colors.green, background: colors.greenSoft },
  sync: { icon: 'swap-horizontal-outline', label: 'Channel sync', color: colors.inkMuted, background: colors.surfaceSoft },
  failure: { icon: 'alert-circle-outline', label: 'Failed safely', color: colors.red, background: colors.redSoft },
};

export default function ActivityScreen() {
  const { activity, approvals, retryActivity, pendingAction, selectApproval } = useAppState();
  const pending = approvals.filter((item) => item.status === 'pending');
  return <Screen>
    <Eyebrow>Audit trail</Eyebrow><ScreenTitle>Activity</ScreenTitle>
    <Text style={styles.intro}>See who acted, what happened, and whether the connected channel confirmed it.</Text>
    {pending.length > 0 && <Pressable accessibilityRole="button" onPress={() => { selectApproval(pending[0].id); router.push('/approvals'); }} style={({ pressed }) => [styles.approvalsLink, pressed && { opacity: 0.8 }]}><View><Text style={styles.approvalsTitle}>{pending.length} change(s) need approval</Text><Text style={styles.approvalsText}>Review before anything is sent</Text></View><Ionicons name="arrow-forward" size={20} color={colors.green} /></Pressable>}
    <View style={styles.feed}>{activity.map((item, index) => {
      const read = kindRead[item.kind];
      const loading = pendingAction === `activity:${item.id}`;
      return <View key={item.id} style={styles.row}>
        <View style={styles.rail}><View style={[styles.icon, { backgroundColor: read.background }]}><Ionicons name={item.retried ? 'checkmark' : read.icon} size={18} color={item.retried ? colors.green : read.color} /></View>{index < activity.length - 1 && <View style={styles.line} />}</View>
        <View style={styles.copy}><View style={styles.metaRow}><Text style={[styles.kind, { color: read.color }]}>{item.retried ? 'Retry accepted' : read.label}</Text><Text style={styles.time}>{item.time}</Text></View><Text style={styles.title}>{item.title}</Text><Text style={styles.detail}>{item.retried ? 'The local demo accepted the retry. A production service would wait for provider confirmation.' : item.detail}</Text>
          {item.retryable && <Pressable accessibilityRole="button" disabled={loading} onPress={() => retryActivity(item.id)} style={({ pressed }) => [styles.retry, pressed && { opacity: 0.7 }]}><Ionicons name="refresh" size={16} color={colors.red} /><Text style={styles.retryText}>{loading ? 'Retrying safely...' : 'Retry safely'}</Text></Pressable>}
        </View>
      </View>;
    })}</View>
  </Screen>;
}

const styles = StyleSheet.create({
  intro: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }, approvalsLink: { minHeight: 70, marginTop: spacing.xl, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, approvalsTitle: { color: colors.green, fontSize: 14, fontWeight: '800' }, approvalsText: { color: colors.inkMuted, fontSize: 12, marginTop: 3 },
  feed: { marginTop: spacing.xxl }, row: { flexDirection: 'row', gap: spacing.md, minHeight: 124 }, rail: { width: 40, alignItems: 'center' }, icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, line: { width: 1, flex: 1, backgroundColor: colors.line, marginVertical: 5 }, copy: { flex: 1, paddingBottom: spacing.xl }, metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, kind: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 }, time: { color: colors.inkFaint, fontSize: 11 }, title: { color: colors.ink, fontSize: 15, fontWeight: '800', marginTop: 7 }, detail: { color: colors.inkMuted, fontSize: 13, lineHeight: 19, marginTop: 5 }, retry: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start' }, retryText: { color: colors.red, fontSize: 12, fontWeight: '800' },
});
