class NotificationService {
  async requestPermission(): Promise<boolean> {
    console.log("Requesting notification permission");
    // Placeholder for FCM request permission
    return true;
  }

  async getToken(): Promise<string | null> {
    console.log("Getting FCM token");
    // Placeholder for FCM getToken
    return null;
  }
}

export const notificationService = new NotificationService();
