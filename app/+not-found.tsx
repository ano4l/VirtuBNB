import { router } from 'expo-router';
import { EmptyState, PrimaryButton, Screen } from '@/src/components/ui';

export default function NotFoundScreen() {
  return <Screen><EmptyState icon="compass-outline" title="This page is not available" body="Return to Today to keep managing your properties." /><PrimaryButton label="Return to Today" onPress={() => router.replace('/')} /></Screen>;
}
