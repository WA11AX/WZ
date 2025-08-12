import type { TelegramWebApp } from "@/types/telegram";
import WebApp from "@twa-dev/sdk";

let webApp: TelegramWebApp | null = null;

export function initTelegram() {
  try {
    console.log("Initializing Telegram Web App");

    // Проверяем, что мы внутри Telegram
    if (!WebApp.initDataUnsafe.user && process.env.NODE_ENV === "production") {
      console.warn("Not running inside Telegram Web App");
      return false;
    }

    WebApp.ready();
    WebApp.expand();

    // Настройка цветовой схемы
    WebApp.setHeaderColor("#1f2937");
    WebApp.setBottomBarColor("#ffffff");

    // Скрываем главную кнопку по умолчанию
    WebApp.MainButton.hide();

    return true;
  } catch (error) {
    console.error("Failed to initialize Telegram Web App:", error);
    return false;
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  // Fallback for development/testing if webApp is not initialized but WebApp SDK is available
  if (!webApp && typeof window !== "undefined" && window.Telegram?.WebApp) {
    webApp = window.Telegram.WebApp;
    webApp.ready();
    webApp.expand();
  }
  return webApp;
}

export function getTelegramUser() {
  try {
    return WebApp.initDataUnsafe.user;
  } catch (error) {
    console.error("Failed to get Telegram user:", error);
    return null;
  }
}

export function showMainButton(text: string, onClick: () => void) {
  try {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.show();
    WebApp.MainButton.onClick(onClick);
  } catch (error) {
    console.error("Failed to show main button:", error);
  }
}

export function hideMainButton() {
  try {
    WebApp.MainButton.hide();
  } catch (error) {
    console.error("Failed to hide main button:", error);
  }
}

export function showBackButton(onClick: () => void) {
  try {
    if (WebApp.BackButton) {
      WebApp.BackButton.onClick(onClick);
      WebApp.BackButton.show();
    }
  } catch (error) {
    console.error("Failed to show back button:", error);
  }
}

export function hideBackButton() {
  try {
    if (WebApp.BackButton) {
      WebApp.BackButton.hide();
    }
  } catch (error) {
    console.error("Failed to hide back button:", error);
  }
}

export function processStarsPayment(amount: number, tournamentId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (WebApp) {
      // In a real implementation, this would use Telegram's payment API
      // For now, we simulate the payment process
      const invoiceUrl = `https://t.me/invoice/stars?amount=${amount}&payload=${tournamentId}`;

      WebApp.openInvoice(invoiceUrl, (status: string) => {
        resolve(status === "paid");
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
    "X-Telegram-User-Id": user?.id?.toString() || "mock-user",
  };
}

export function showAlert(message: string) {
  try {
    WebApp.showAlert(message);
  } catch (error) {
    console.error("Failed to show alert:", error);
    // Fallback to browser alert
    alert(message);
  }
}

export function hapticFeedback(type: "impact" | "notification" | "selection" = "impact") {
  try {
    if (!WebApp.HapticFeedback) return;

    if (type === "impact") {
      WebApp.HapticFeedback.impactOccurred("medium");
    } else if (type === "notification") {
      WebApp.HapticFeedback.notificationOccurred("success");
    } else {
      WebApp.HapticFeedback.selectionChanged();
    }
  } catch (error) {
    console.error("Haptic feedback failed:", error);
  }
}
