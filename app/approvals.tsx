import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Body, Card, EmptyState, Eyebrow, PrimaryButton, Screen, SecondaryButton } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';
import { colors, radius, spacing } from '@/src/theme';

export default function ApprovalsScreen() {
  const { approval, properties, decideApproval, pendingAction } = useAppState();
  if (!approval) return <Screen><EmptyState icon="checkmark-done-outline" title="No proposals to review" body="Listing changes requested through chat will appear here." /></Screen>;
  const property = properties.find((item) => item.id === approval.propertyId);
  const deciding = pendingAction?.startsWith('approval:') ?? false;
  if (approval.status === 'expired') return <Screen><EmptyState icon="time-outline" title="This proposal has expired" body="Request a new change through chat to review up-to-date details." /><SecondaryButton label="Back to Today" onPress={() => router.replace('/')} /></Screen>;

  if (approval.status !== 'pending') return <Screen>
    <Card style={styles.success}><View style={styles.successIcon}><Ionicons name={approval.status === 'approved' ? 'checkmark' : 'close'} size={26} color="#fff" /></View><Text style={styles.successTitle}>{approval.status === 'approved' ? 'Proposal approved' : 'Proposal rejected'}</Text><Body muted>{approval.status === 'approved' ? 'This local demo recorded your approval. No live listing was changed.' : 'The proposal was closed and will not be sent.'}</Body><View style={styles.singleAction}><SecondaryButton label="Back to Today" onPress={() => router.replace('/')} /></View></Card>
  </Screen>;

  return <Screen>
    <Eyebrow>Approval required</Eyebrow>
    <Text style={styles.title}>Review the listing change</Text>
    <Text style={styles.intro}>VirtuHost will never treat a preview as permission to publish.</Text>
    <View style={styles.context}><View><Text style={styles.contextLabel}>Property</Text><Text style={styles.contextValue}>{property?.name}</Text></View><View><Text style={styles.contextLabel}>Expires</Text><Text style={styles.contextValue}>{approval.expires}</Text></View></View>
    <Card style={styles.decision}>
      <View style={styles.fieldRow}><Ionicons name="images-outline" size={20} color={colors.green} /><Text style={styles.field}>{approval.field}</Text></View>
      {approval.changes?.length ? <View style={styles.changeList}>{approval.changes.map((change, index) => <View key={change.field} style={[styles.changeRow, index > 0 && styles.changeBorder]}><Text style={styles.changeField}>{change.field}</Text><View style={styles.preview}><View style={styles.previewItem}><Text style={styles.previewLabel}>Before</Text><Text style={styles.previewValue}>{change.before}</Text></View><Ionicons name="arrow-forward" size={18} color={colors.inkFaint} style={styles.arrow} /><View style={styles.previewItem}><Text style={[styles.previewLabel, { color: colors.green }]}>Proposed</Text><Text style={styles.previewValue}>{change.after}</Text></View></View></View>)}</View> : <View style={styles.preview}>
        <View style={styles.previewItem}><Text style={styles.previewLabel}>Before</Text><Text style={styles.previewValue}>{approval.before}</Text></View><Ionicons name="arrow-forward" size={21} color={colors.inkFaint} style={styles.arrow} /><View style={styles.previewItem}><Text style={[styles.previewLabel, { color: colors.green }]}>Proposed</Text><Text style={styles.previewValue}>{approval.after}</Text></View>
      </View>}
    </Card>
    <View style={styles.requested}><Ionicons name="logo-whatsapp" size={18} color={colors.green} /><View><Text style={styles.contextLabel}>Requested through</Text><Text style={styles.requestedValue}>{approval.requestedBy}</Text></View></View>
    <View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={20} color={colors.green} /><Text style={styles.noticeText}>Demo only. Approval is recorded locally and does not update a connected listing.</Text></View>
    <View style={styles.actions}><PrimaryButton label="Approve proposal" icon="checkmark" loading={pendingAction === 'approval:approved'} disabled={deciding} onPress={() => decideApproval('approved')} /><SecondaryButton label="Reject" icon="close" danger disabled={deciding} loading={pendingAction === 'approval:rejected'} onPress={() => decideApproval('rejected')} /></View>
  </Screen>;
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 }, intro: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  context: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }, contextLabel: { color: colors.inkFaint, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 }, contextValue: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 4 },
  decision: { marginTop: spacing.xl, padding: spacing.xl }, fieldRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, field: { color: colors.ink, fontSize: 16, fontWeight: '800', flex: 1 }, changeList: { marginTop: spacing.lg }, changeRow: { paddingVertical: spacing.md }, changeBorder: { borderTopWidth: 1, borderTopColor: colors.line }, changeField: { color: colors.ink, fontSize: 13, fontWeight: '800' }, preview: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.md }, previewItem: { flex: 1 }, previewLabel: { color: colors.inkMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: spacing.sm }, imageField: { height: 110, borderRadius: radius.md, justifyContent: 'flex-end', alignItems: 'flex-start', padding: spacing.md, overflow: 'hidden' }, before: { backgroundColor: '#D7DBD9' }, after: { backgroundColor: '#C9DECF' }, previewValue: { color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: '700' }, arrow: { marginTop: 30 },
  requested: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, requestedValue: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 3 }, notice: { marginTop: spacing.xl, backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }, noticeText: { flex: 1, color: colors.greenDark, fontSize: 12, lineHeight: 18, fontWeight: '600' }, actions: { marginTop: spacing.xl, gap: spacing.md },
  success: { marginTop: 64, alignItems: 'center', padding: spacing.huge }, successIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }, successTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', marginBottom: spacing.sm }, singleAction: { width: '100%', marginTop: spacing.xl },
});
