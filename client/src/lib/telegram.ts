// Use the global Telegram WebApp object from types/telegram.ts
import type { TelegramWebApp } from "../types/telegram";
import { toast } from "@/hooks/use-toast";

let webApp: TelegramWebApp | null = null;

export function initTelegram() {
  try {
    // Get the WebApp from window object
    const WebApp = window.Telegram?.WebApp;

    if (!WebApp) {
      toast({ variant: "destructive", description: "Telegram WebApp not available" });
      return false;
    }

    // Проверяем, что мы внутри Telegram
    if (!WebApp.initDataUnsafe?.user && process.env.NODE_ENV === "production") {
      toast({ variant: "destructive", description: "Not running inside Telegram Web App" });
      return false;
    }

    WebApp.ready();
    WebApp.expand();

    // Настройка цветовой схемы - these methods might not exist outside Telegram
    if (WebApp.setHeaderColor) {
      WebApp.setHeaderColor("#1f2937");
    }
    if (WebApp.setBottomBarColor) {
      WebApp.setBottomBarColor("#ffffff");
    }

    // Скрываем главную кнопку по умолчанию
    if (WebApp.MainButton) {
      WebApp.MainButton.hide();
    }

    webApp = WebApp;

    return true;
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to initialize Telegram Web App" });
    return false;
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  // Fallback for development/testing if webApp is not initialized but WebApp SDK is available
  if (!webApp && window?.Telegram?.WebApp) {
    webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
  }
  return webApp;
}

export function getTelegramUser() {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to get Telegram user" });
    return null;
  }
}

export function showMainButton(text: string, onClick: () => void) {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.MainButton) {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(onClick);
    }
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to show main button" });
  }
}

export function hideMainButton() {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.MainButton) {
      WebApp.MainButton.hide();
    }
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to hide main button" });
  }
}

export function showBackButton(onClick: () => void) {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.BackButton) {
      WebApp.BackButton.onClick(onClick);
      WebApp.BackButton.show();
    }
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to show back button" });
  }
}

export function hideBackButton() {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.BackButton) {
      WebApp.BackButton.hide();
    }
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to hide back button" });
  }
}

export function processStarsPayment(amount: number, tournamentId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.openInvoice) {
      // In a real implementation, this would use Telegram's payment API
      // For now, we simulate the payment process
      const invoiceUrl = `https://t.me/invoice/stars?amount=${amount}&payload=${tournamentId}`;

      WebApp.openInvoice(invoiceUrl, (status: string) => {
        resolve(status === "paid");
      });
    } else {
      // Fallback for development/testing
      toast({ description: `Simulated payment of ${amount} Telegram Stars` });
      resolve(true);
    }
  });
}

export function getAuthHeaders(): Record<string, string> {
  const initData = window.Telegram?.WebApp?.initData;
  if (!initData) {
    return {};
  }

  return {
    "x-telegram-init-data": initData,
  };
}

export function showAlert(message: string) {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp?.showAlert) {
      WebApp.showAlert(message);
    } else {
      toast({ description: message });
    }
  } catch (error) {
    toast({ variant: "destructive", description: "Failed to show alert" });
    toast({ description: message });
  }
}

export function hapticFeedback(type: "impact" | "notification" | "selection" = "impact") {
  try {
    const WebApp = window.Telegram?.WebApp;
    if (!WebApp?.HapticFeedback) return;

    if (type === "impact") {
      WebApp.HapticFeedback.impactOccurred("medium");
    } else if (type === "notification") {
      WebApp.HapticFeedback.notificationOccurred("success");
    } else {
      WebApp.HapticFeedback.selectionChanged();
    }
  } catch (error) {
    toast({ variant: "destructive", description: "Haptic feedback failed" });
  }
}
