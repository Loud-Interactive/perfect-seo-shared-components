import OneSignal from 'react-onesignal';
import { OneSignalOptions } from '../data/types';

const useNotification = () => {


  async function runOneSignal(options: OneSignalOptions) {
    const { appId, safari_web_id, message } = options;
    let promptOptions: any = {
      serviceWorkerParam: {
        scope: '/content',
      },
      appId: appId,
      safari_web_id: safari_web_id,
      serviceWorkerPath: 'OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: 'OneSignalSDKWorker.js',
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: 'push', // current types are "push" & "category"
              autoPrompt: true,
              text: {
                /* limited to 90 characters */
                actionMessage: message,
                /* acceptButton limited to 15 characters */
                acceptButton: 'Allow',
                /* cancelButton limited to 15 characters */
                cancelButton: 'No Thanks',
              },
              delay: {
                pageViews: 1,
                timeDelay: 20,
              },
            },
          ],
        },
      },
    };
    try {
      if (window?.location?.hostname === 'localhost') {
        promptOptions = { ...promptOptions, allowLocalhostAsSecureOrigin: true, }
      }
    }
    catch (e) {

    }
    await OneSignal.init(promptOptions)
    OneSignal.Slidedown.promptPush();

  }
  return {
    runOneSignal,
  };
};

export default useNotification;