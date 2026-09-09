import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Card, EmptyState, Eyebrow, Screen, ScreenTitle, StatusDot } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';
import { colors, radius, spacing } from '@/src/theme';
import { getPropertyPresentation } from '@/src/selectors';

export default function PropertiesScreen() {
  const { properties, approval, activity } = useAppState();
  const [showEmpty, setShowEmpty] = useState(false);
  return <Screen>
    <Eyebrow>Portfolio</Eyebrow><ScreenTitle>Your properties</ScreenTitle>
    <Text style={styles.intro}>A calm view of every stay, handover and connection.</Text>
    <View style={styles.demoToggle}><View><Text style={styles.toggleTitle}>Preview empty state</Text><Text style={styles.toggleText}>Demo control</Text></View><Switch accessibilityLabel="Preview empty properties state" value={showEmpty} onValueChange={setShowEmpty} trackColor={{ false: colors.line, true: colors.greenSoft }} thumbColor={showEmpty ? colors.green : '#fff'} /></View>
    {showEmpty ? <Card style={styles.emptyCard}><EmptyState icon="business-outline" title="No properties connected" body="Connected properties will appear here with their stays, workflows and sync health." /></Card> : <View style={styles.list}>
      {properties.map((property) => {
        const presentation = getPropertyPresentation(property, approval, activity);
        return <Pressable key={property.id} accessibilityRole="button" onPress={() => router.push(`/property/${property.id}`)} style={({ pressed }) => [styles.property, pressed && { opacity: 0.82 }]}>
        <View style={[styles.thumbnail, { backgroundColor: property.accent }]}><Ionicons name={property.icon} size={28} color={colors.ink} /><View style={styles.thumbnailLine} /></View>
        <View style={styles.propertyCopy}><View style={styles.titleRow}><Text style={styles.propertyName}>{property.name}</Text><Ionicons name="chevron-forward" size={19} color={colors.inkFaint} /></View><Text style={styles.area}>{property.area}</Text>
          <View style={styles.statRow}><View style={styles.status}><StatusDot tone="green" /><Text style={styles.statusText}>{property.status}</Text></View><Text style={styles.occupancy}>{property.occupancy}</Text></View>
          <Text style={styles.next}>{property.nextStay}</Text>
          <View style={[styles.sync, presentation.syncHealth === 'Attention' && styles.syncWarning]}><Ionicons name={presentation.syncHealth === 'Healthy' ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={15} color={presentation.syncHealth === 'Healthy' ? colors.green : colors.amber} /><Text style={[styles.syncText, presentation.syncHealth === 'Attention' && { color: colors.amber }]}>{presentation.syncLabel}</Text></View>
        </View>
      </Pressable>;})}
    </View>}
  </Screen>;
}

const styles = StyleSheet.create({
  intro: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  demoToggle: { marginTop: spacing.xl, minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line },
  toggleTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' }, toggleText: { color: colors.inkFaint, fontSize: 11, marginTop: 2 },
  list: { gap: spacing.md, marginTop: spacing.xl }, property: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  thumbnail: { height: 104, padding: spacing.lg, justifyContent: 'flex-end', alignItems: 'flex-start' }, thumbnailLine: { position: 'absolute', width: 82, height: 42, borderTopWidth: 2, borderRightWidth: 2, borderColor: 'rgba(23,32,28,0.18)', right: 22, bottom: 0 },
  propertyCopy: { padding: spacing.lg }, titleRow: { flexDirection: 'row', alignItems: 'center' }, propertyName: { flex: 1, color: colors.ink, fontSize: 18, fontWeight: '800' }, area: { color: colors.inkMuted, fontSize: 12, marginTop: 3 },
  statRow: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, status: { flexDirection: 'row', alignItems: 'center', gap: 6 }, statusText: { color: colors.ink, fontSize: 12, fontWeight: '700' }, occupancy: { color: colors.inkMuted, fontSize: 12 },
  next: { color: colors.ink, fontSize: 13, marginTop: spacing.md }, sync: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 6 }, syncWarning: { borderTopColor: '#E9D3AE' }, syncText: { color: colors.green, fontSize: 11, fontWeight: '700' }, emptyCard: { marginTop: spacing.xl },
});
