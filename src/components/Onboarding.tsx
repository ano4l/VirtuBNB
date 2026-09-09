import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orb } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';

export function Onboarding() {
  const { completeOnboarding } = useAppState();
  return <ImageBackground source={require('../../assets/properties/rosebank-loft.png')} resizeMode="cover" style={styles.safe}><View style={styles.shade} /><SafeAreaView style={styles.safe}><View style={styles.container}><View style={styles.brand}><Orb size={28} /><Text style={styles.wordmark}>VIRTUHOST</Text></View><View style={styles.spacer} /><Text style={styles.title}>Hosting,{`\n`}intelligently.</Text><Text style={styles.body}>Manage your properties, guests and bookings with an AI assistant that works alongside you.</Text><Pressable accessibilityRole="button" onPress={completeOnboarding} style={({ pressed }) => [styles.next, pressed && styles.pressed]}><Text style={styles.nextText}>Get Started</Text></Pressable><Pressable accessibilityRole="button" onPress={completeOnboarding} style={styles.signIn}><Text style={styles.signInText}>Sign In</Text></Pressable></View></SafeAreaView></ImageBackground>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,5,5,0.32)' }, container: { flex: 1, paddingHorizontal: 24, paddingBottom: 26, maxWidth: 620, width: '100%', alignSelf: 'center' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10 }, wordmark: { color: 'rgba(255,255,255,.92)', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 }, spacer: { flex: 1 }, title: { color: '#fff', fontSize: 46, lineHeight: 49, fontWeight: '900', letterSpacing: -1.5 }, body: { color: 'rgba(255,255,255,.68)', fontSize: 17, lineHeight: 27, maxWidth: 330, marginTop: 16, marginBottom: 34 }, next: { minHeight: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.34)', alignItems: 'center', justifyContent: 'center' }, nextText: { color: '#fff', fontSize: 17, fontWeight: '700' }, signIn: { minHeight: 52, alignItems: 'center', justifyContent: 'center' }, signInText: { color: 'rgba(255,255,255,.65)', fontSize: 16, fontWeight: '600' }, pressed: { opacity: .8, transform: [{ scale: .985 }] },
});
