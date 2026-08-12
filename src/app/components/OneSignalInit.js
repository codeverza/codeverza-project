'use client';

import { useEffect } from 'react';

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only run on production — OneSignal doesn't work on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        notifyButton: { enable: true },
        allowLocalhostAsSecureOrigin: true,
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: 'push',
                autoPrompt: true,
                text: {
                  actionMessage: 'Stay updated with the latest news and offers from Codeverza!',
                  acceptButton: 'Allow',
                  cancelButton: 'No Thanks',
                },
                delay: {
                  pageViews: 1,
                  timeDelay: 3,
                },
              },
            ],
          },
        },
      });
    });

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
