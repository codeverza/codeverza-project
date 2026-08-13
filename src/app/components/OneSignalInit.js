'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      notifyButton: {
        enable: true,
      },
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
  }, []);

  return null;
}
