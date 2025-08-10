import type { TelegramWebApp } from "@/types/telegram";

let webApp: TelegramWebApp | null = null;

export function initTelegram() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
    
    // Configure main button
    webApp.MainButton.color = '#0088CC';
    webApp.MainButton.textColor = '#FFFFFF';
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return webApp;
}

export function getTelegramUser() {
  return webApp?.initDataUnsafe?.user || null;
}

export function showMainButton(text: string, onClick: () => void) {
  if (webApp?.MainButton) {
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  }
}

export function hideMainButton() {
  if (webApp?.MainButton) {
    webApp.MainButton.hide();
  }
}

export function showBackButton(onClick: () => void) {
  if (webApp?.BackButton) {
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  }
}

export function hideBackButton() {
  if (webApp?.BackButton) {
    webApp.BackButton.hide();
  }
}

export function processStarsPayment(amount: number, tournamentId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (webApp) {
      // In a real implementation, this would use Telegram's payment API
      // For now, we simulate the payment process
      const invoiceUrl = `https://t.me/invoice/stars?amount=${amount}&payload=${tournamentId}`;
      
      webApp.openInvoice(invoiceUrl, (status: string) => {
        resolve(status === 'paid');
      });
    } else {
      // Fallback for development/testing
      const confirmed = window.confirm(`Pay ${amount} Telegram Stars to join tournament?`);
      resolve(confirmed);
    }
  });
}

export function getAuthHeaders(): Record<string, string> {
  const user = getTelegramUser();
  return {
    'X-Telegram-User-Id': user?.id?.toString() || 'mock-user',
  };
}
