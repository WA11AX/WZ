import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { TelegramWebApp } from '../types/telegram';

let webApp: TelegramWebApp | null = null;

function initTelegram() {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (!WebApp) return false;
    if (!WebApp.initDataUnsafe?.user && process.env.NODE_ENV === 'production') {
      return false;
    }
    WebApp.ready();
    WebApp.expand();
    if (WebApp.setHeaderColor) {
      WebApp.setHeaderColor('#1f2937');
    }
    if (WebApp.setBottomBarColor) {
      WebApp.setBottomBarColor('#ffffff');
    }
    if (WebApp.MainButton) {
      WebApp.MainButton.hide();
    }
    webApp = WebApp;
    return true;
  } catch (_error) {
    return false;
  }
}

function getTelegramWebApp(): TelegramWebApp | null {
  if (!webApp && window?.Telegram?.WebApp) {
    webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
  }
  return webApp;
}

function getTelegramUser() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  } catch (_error) {
    return null;
  }
}

function showMainButton(text: string, onClick: () => void) {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.MainButton) {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(onClick);
    }
  } catch (_error) {
    // ignore
  }
}

function hideMainButton() {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.MainButton) {
      WebApp.MainButton.hide();
    }
  } catch (_error) {
    // ignore
  }
}

function showBackButton(onClick: () => void) {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(onClick);
      WebApp.BackButton.show();
    }
  } catch (_error) {
    // ignore
  }
}

function hideBackButton() {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.BackButton) {
      WebApp.BackButton.hide();
    }
  } catch (_error) {
    // ignore
  }
}

function processStarsPayment(amount: number, tournamentId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.openInvoice) {
      const invoiceUrl = `https://t.me/invoice/stars?amount=${amount}&payload=${tournamentId}`;
      WebApp.openInvoice(invoiceUrl, (status: string) => {
        resolve(status === 'paid');
      });
    } else {
      const confirmed = window.confirm(`Pay ${amount} Telegram Stars to join tournament?`);
      resolve(confirmed);
    }
  });
}

function getAuthHeaders(): Record<string, string> {
  const initData = window.Telegram?.WebApp?.initData;
  if (!initData) {
    return {};
  }
  return { 'x-telegram-init-data': initData };
}

function showAlert(message: string) {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.showAlert) {
      WebApp.showAlert(message);
    } else {
      alert(message);
    }
  } catch (_error) {
    alert(message);
  }
}

function hapticFeedback(type: 'impact' | 'notification' | 'selection' = 'impact') {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (!WebApp?.HapticFeedback) return;
    if (type === 'impact') {
      WebApp.HapticFeedback.impactOccurred('medium');
    } else if (type === 'notification') {
      WebApp.HapticFeedback.notificationOccurred('success');
    } else {
      WebApp.HapticFeedback.selectionChanged();
    }
  } catch (_error) {
    // ignore
  }
}

const telegramService = {
  getAuthHeaders,
  processStarsPayment,
  showBackButton,
  hideBackButton,
};

const TelegramContext = createContext(telegramService);

export function TelegramProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initTelegram();
  }, []);
  return <TelegramContext.Provider value={telegramService}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  return useContext(TelegramContext);
}

export {
  initTelegram,
  getTelegramWebApp,
  getTelegramUser,
  showMainButton,
  hideMainButton,
  showBackButton,
  hideBackButton,
  processStarsPayment,
  getAuthHeaders,
  showAlert,
  hapticFeedback,
};
