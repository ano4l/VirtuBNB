import { Ionicons } from '@expo/vector-icons';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/src/theme';
import { useAppState } from '@/src/state/AppState';
import { router } from 'expo-router';
import { useBottomNavClearance } from '@/src/layout';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const { error } = useAppState();
  const bottomClearance = useBottomNavClearance();
  const contentStyle = [styles.content, { paddingBottom: bottomClearance }];
  const content = scroll ? <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={contentStyle}>{children}</View>;
  return <SafeAreaView style={styles.safe}><Ambient />
    {error && <View style={styles.errorWrap}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></View>}{content}</SafeAreaView>;
}

export function Ambient() { return <View pointerEvents="none" style={StyleSheet.absoluteFill}><View style={styles.ambientA} /><View style={styles.ambientB} /></View>; }

export function Orb({ size = 42, busy = false }: { size?: number; busy?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => { let animation: Animated.CompositeAnimation | undefined; AccessibilityInfo.isReduceMotionEnabled().then((reduce) => { if (reduce) return; animation = Animated.loop(Animated.sequence([Animated.timing(scale, { toValue: busy ? 1.12 : 1.05, duration: busy ? 650 : 1800, useNativeDriver: true }), Animated.timing(scale, { toValue: 1, duration: busy ? 650 : 1800, useNativeDriver: true })])); animation.start(); }); return () => animation?.stop(); }, [busy, scale]);
  return <Animated.View accessibilityLabel={busy ? 'Virtu is thinking' : 'Virtu AI'} style={[styles.orb, { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] }]}><View style={[styles.orbLight, { width: size * .62, height: size * .62, borderRadius: size }]} /><View style={[styles.orbCore, { width: size * .34, height: size * .34, borderRadius: size }]} /></Animated.View>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) { return <View style={styles.pageHeader}><View style={{ flex: 1 }}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}</View>{action}</View>; }

export function Eyebrow({ children }: PropsWithChildren) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function ScreenTitle({ children }: PropsWithChildren) { return <Text style={styles.title}>{children}</Text>; }
export function Body({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) { return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>; }

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusDot({ tone = 'green' }: { tone?: 'green' | 'amber' | 'red' | 'neutral' }) {
  return <View style={[styles.dot, { backgroundColor: colors[tone] }]} />;
}

export function PrimaryButton({ label, icon, onPress, loading, disabled, tone = 'green' }: { label: string; icon?: keyof typeof Ionicons.glyphMap; onPress: () => void; loading?: boolean; disabled?: boolean; tone?: 'green' | 'red' }) {
  const blocked = Boolean(loading || disabled);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={blocked} onPress={onPress} style={({ pressed }) => [styles.primary, tone === 'red' && styles.primaryRed, blocked && styles.disabled, pressed && !blocked && styles.pressed]}>
    {loading ? <ActivityIndicator color="#fff" /> : <>{icon && <Ionicons name={icon} size={19} color="#fff" />}<Text style={styles.primaryText}>{label}</Text></>}
  </Pressable>;
}

export function SecondaryButton({ label, onPress, icon, loading, danger, disabled }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; loading?: boolean; danger?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={loading || disabled} onPress={onPress} style={({ pressed }) => [styles.secondary, danger && styles.secondaryDanger, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={danger ? colors.red : colors.ink} /> : <>{icon && <Ionicons name={icon} size={18} color={danger ? colors.red : colors.ink} />}<Text style={[styles.secondaryText, danger && { color: colors.red }]}>{label}</Text></>}
  </Pressable>;
}

export function EmptyState({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={26} color={colors.green} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md, width: '100%', maxWidth: 640, alignSelf: 'center' },
  errorWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, maxWidth: 640, width: '100%', alignSelf: 'center' },
  errorText: { color: colors.red, fontSize: 13, paddingVertical: 8 },
  eyebrow: { color: colors.green, fontSize: 12, lineHeight: 16, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.7 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.inkMuted },
  sectionHeader: { minHeight: 44, marginTop: spacing.xxl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  card: { backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', padding: spacing.lg, ...Platform.select({ web: { boxShadow: '0 5px 22px rgba(26,22,48,0.05)' } as never, default: { shadowColor: '#171426', shadowOpacity: .06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 } }) },
  dot: { width: 8, height: 8, borderRadius: 4 },
  primary: { minHeight: 54, paddingHorizontal: spacing.lg, borderRadius: 18, backgroundColor: colors.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  primaryRed: { backgroundColor: colors.red },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondary: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  secondaryDanger: { borderColor: '#EDC5C0', backgroundColor: colors.redSoft },
  secondaryText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  empty: { paddingVertical: 44, paddingHorizontal: spacing.xxl, alignItems: 'center' },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft, marginBottom: spacing.lg },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm },
  emptyBody: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  ambientA: { position: 'absolute', width: 330, height: 270, borderRadius: 200, top: -150, left: -120, backgroundColor: 'rgba(190,178,255,0.16)' },
  ambientB: { position: 'absolute', width: 280, height: 240, borderRadius: 180, right: -140, bottom: 80, backgroundColor: 'rgba(154,187,255,0.10)' },
  orb: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)', shadowColor: '#6955C4', shadowOpacity: .24, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  orbLight: { position: 'absolute', top: '5%', left: '2%', backgroundColor: 'rgba(183,171,255,0.72)' },
  orbCore: { backgroundColor: '#7B6FD4', opacity: .82 },
  pageHeader: { minHeight: 62, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  pageSubtitle: { color: colors.inkMuted, fontSize: 14, marginTop: 5 },
});
