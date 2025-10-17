export const useAnalytics = () => {
  const initGoogleAnalytics = (measurementId: string) => {
    if (process.client && measurementId) {
      // Google Analytics 4
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        // @ts-ignore
        dataLayer.push(args);
      }
      // @ts-ignore
      gtag('js', new Date());
      // @ts-ignore
      gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
    }
  };

  const initGoogleSearchConsole = (verificationId: string) => {
    if (process.client && verificationId) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = verificationId;
      document.head.appendChild(meta);
    }
  };

  const initFacebookPixel = (pixelId: string) => {
    if (process.client && pixelId) {
      // Facebook Pixel
      !function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      // @ts-ignore
      fbq('init', pixelId);
      // @ts-ignore
      fbq('track', 'PageView');
    }
  };

  const trackEvent = (eventName: string, params: any = {}) => {
    if (process.client) {
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        gtag('event', eventName, params);
      }
      // @ts-ignore
      if (window.fbq) {
        // @ts-ignore
        fbq('track', eventName, params);
      }
    }
  };

  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (process.client) {
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: pagePath,
          page_title: pageTitle
        });
      }
    }
  };

  const trackConversion = (conversionId: string, value?: number, currency?: string) => {
    if (process.client) {
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        gtag('event', 'conversion', {
          send_to: conversionId,
          value: value,
          currency: currency
        });
      }
    }
  };

  const trackEcommerce = (transactionId: string, value: number, currency: string, items: any[]) => {
    if (process.client) {
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        gtag('event', 'purchase', {
          transaction_id: transactionId,
          value: value,
          currency: currency,
          items: items
        });
      }
    }
  };

  return {
    initGoogleAnalytics,
    initGoogleSearchConsole,
    initFacebookPixel,
    trackEvent,
    trackPageView,
    trackConversion,
    trackEcommerce
  };
};