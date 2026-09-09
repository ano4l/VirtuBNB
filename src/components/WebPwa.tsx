import { useEffect } from 'react';
import { Platform } from 'react-native';

export function WebPwa() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    document.title = 'VirtuHost | Your hosting copilot';
    document.documentElement.lang = 'en-ZA';

    const ensureMeta = (name: string, content: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!node) {
        node = document.createElement('meta');
        node.name = name;
        document.head.appendChild(node);
      }
      node.content = content;
    };
    ensureMeta('theme-color', '#176B45');
    ensureMeta('mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'default');

    if (!document.head.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = '/manifest.webmanifest';
      document.head.appendChild(manifest);
    }
    if (!document.head.querySelector('link[rel="apple-touch-icon"]')) {
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = '/pwa-icon.png';
      document.head.appendChild(appleIcon);
    }

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  }, []);

  return null;
}
