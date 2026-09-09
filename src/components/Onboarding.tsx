import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/src/theme';
import { useAppState } from '@/src/state/AppState';

const pages = [
  { eyebrow: 'Your hosting companion', title: 'Meet VirtuHost', body: 'Calmer hosting starts with one clear place for every stay, task and listing.', icon: 'home-outline' as const },
  { eyebrow: 'One assistant, two ways', title: 'Ask here or on WhatsApp', body: 'Use the same supported host commands in the app, then continue on WhatsApp whenever it suits you.', icon: 'chatbubbles-outline' as const },
  { eyebrow: 'You stay in control', title: 'Review before publish', body: 'Ask questions, manage listings manually and approve consequential changes before anything is sent to a provider.', icon: 'shield-checkmark-outline' as const },
];

export function Onboarding() {
  const [page, setPage] = useState(0);
  const { completeOnboarding } = useAppState();
  const { height } = useWindowDimensions();
  const item = pages[page];
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
    <View style={styles.top}><Text style={styles.wordmark}>VirtuHost</Text><Pressable accessibilityRole="button" onPress={completeOnboarding} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable></View>
    <View style={[styles.hero, { height: Math.max(245, Math.min(430, height * 0.48)) }]}><Image source={require('../../assets/properties/rosebank-loft.png')} resizeMode="cover" style={[styles.image, page > 0 && { opacity: 0.55 }]} />
      {page > 0 && <View style={styles.heroIcon}><Ionicons name={item.icon} size={30} color="#fff" /></View>}
      <View style={styles.photoLabel}><View style={styles.liveDot} /><Text style={styles.photoLabelText}>Johannesburg portfolio</Text></View>
    </View>
    <View style={styles.copy}><Text style={styles.eyebrow}>{item.eyebrow}</Text><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.body}</Text></View>
    <View style={styles.footer}><View style={styles.progress}>{pages.map((_, index) => <View key={index} style={[styles.progressDot, index === page && styles.progressDotActive]} />)}</View>
      <Pressable accessibilityRole="button" accessibilityLabel={page === 2 ? 'Get started' : 'Next'} onPress={() => page === 2 ? completeOnboarding() : setPage(page + 1)} style={({ pressed }) => [styles.next, pressed && { transform: [{ scale: 0.985 }] }]}><Text style={styles.nextText}>{page === 2 ? 'Get started' : 'Next'}</Text><Ionicons name="arrow-forward" size={19} color="#fff" /></Pressable>
    </View>
    </View></ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F7' }, scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }, container: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center' }, top: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: colors.ink, fontSize: 18, fontWeight: '900', letterSpacing: -0.4 }, skip: { minWidth: 52, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' }, skipText: { color: colors.inkMuted, fontSize: 14, fontWeight: '700' },
  hero: { borderRadius: 30, overflow: 'hidden', backgroundColor: colors.ink, ...shadow }, image: { width: '100%', height: '100%' }, heroIcon: { position: 'absolute', top: '43%', alignSelf: 'center', width: 68, height: 68, borderRadius: 22, backgroundColor: 'rgba(16,84,56,0.92)', alignItems: 'center', justifyContent: 'center' },
  photoLabel: { position: 'absolute', left: 16, bottom: 16, minHeight: 36, borderRadius: 12, backgroundColor: 'rgba(15,23,19,0.82)', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7CDEA9' }, photoLabelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  copy: { paddingTop: spacing.xxl, minHeight: 182 }, eyebrow: { color: colors.green, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' }, title: { color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -1.1, marginTop: 9 }, body: { color: colors.inkMuted, fontSize: 15, lineHeight: 23, marginTop: 10, maxWidth: 440 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }, progress: { flex: 1, flexDirection: 'row', gap: 7 }, progressDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CBD2CE' }, progressDotActive: { width: 25, backgroundColor: colors.green }, next: { minHeight: 54, borderRadius: radius.md, backgroundColor: colors.ink, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }, nextText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
