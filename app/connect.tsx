import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Body, Card, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';
import { colors, spacing } from '@/src/theme';

export default function ConnectScreen() {
  const { connect, disconnect, connected, pendingAction } = useAppState();
  const [url, setUrl] = useState(process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4100');
  const [code, setCode] = useState('');
  const [validation, setValidation] = useState('');
  const submit = async () => {
    try {
      const target = new URL(url.trim());
      if (target.username || target.password || target.search || target.hash || target.pathname !== '/') throw new Error('Use the server address without a path, password or query.');
      if (target.protocol !== 'https:' && !(target.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(target.hostname))) throw new Error('Use HTTPS for a remote server. HTTP is supported only on localhost.');
      if (!/^[a-f0-9]{32}$/i.test(code.trim())) throw new Error('Enter the complete pairing code from the host console.');
      setValidation('');
      await connect(target.origin, code);
      setCode(''); router.replace('/');
    } catch (failure) { setValidation(failure instanceof Error ? failure.message : 'Unable to connect.'); }
  };
  return <Screen>
    <ScreenTitle>Connect your workspace</ScreenTitle>
    <View style={styles.gap}><Body muted>See the same tasks and approvals as your VirtuHost chat. Pairing connects the shared demo workspace; it does not connect Airbnb.</Body></View>
    <Card style={styles.gap}>
      <Text style={styles.label}>Server address</Text>
      <TextInput accessibilityLabel="Server address" autoCapitalize="none" autoCorrect={false} value={url} onChangeText={setUrl} style={styles.input} placeholder="https://your-server.example" />
      <Text style={styles.label}>Pairing code</Text>
      <TextInput accessibilityLabel="Pairing code" autoCapitalize="none" autoCorrect={false} value={code} onChangeText={setCode} style={styles.input} placeholder="Paste your one-time code" secureTextEntry />
      <Body muted>In the local host console, type PAIR. The code expires after five minutes and works once.</Body>
      {validation ? <Text accessibilityRole="alert" style={styles.error}>{validation}</Text> : null}
      <View style={styles.gap}><PrimaryButton label="Connect workspace" onPress={submit} loading={pendingAction === 'connect'} /></View>
    </Card>
    {connected && <View style={styles.gap}><SecondaryButton label="Disconnect workspace" onPress={() => { void disconnect().then(() => router.replace('/')); }} /></View>}
    <View style={styles.gap}><Body muted>The app keeps its session in memory. Pair again after reloading. On a phone, use your development server's HTTPS address.</Body></View>
  </Screen>;
}
const styles = StyleSheet.create({ gap: { marginTop: spacing.lg }, label: { fontSize: 14, color: colors.ink, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, marginBottom: 18, color: colors.ink, backgroundColor: colors.surface },
  error: { color: colors.red, fontSize: 14, lineHeight: 21, marginTop: 12 } });
