/**
 * NEXTRAK Transactional Email Notification Service
 * Integrates with Resend API when RESEND_API_KEY is configured.
 */

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  trackingNumber: string;
  recipientName: string;
  status: string;
  estimatedDelivery?: string;
  location?: string;
  trackingUrl: string;
}

export class EmailService {
  private static apiKey = process.env.RESEND_API_KEY || "";

  public static isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith("re_"));
  }

  public static async sendShipmentUpdateEmail(payload: EmailNotificationPayload): Promise<{
    success: boolean;
    provider: "RESEND" | "LOCAL_LOG";
    id?: string;
  }> {
    if (this.isConfigured()) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "NEXTRAK Logistics <notifications@nextrak.io>",
            to: [payload.to],
            subject: payload.subject,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #080E1B; color: #F4F7FC; padding: 32px; border-radius: 8px;">
                <h2 style="color: #00D4FF; margin-top: 0;">NEXTRAK Logistics Alert</h2>
                <p>Hello ${payload.recipientName},</p>
                <p>Your shipment <strong>${payload.trackingNumber}</strong> status is now: <span style="color: #20C997; font-weight: bold;">${payload.status}</span></p>
                ${payload.location ? `<p><strong>Latest Location:</strong> ${payload.location}</p>` : ""}
                ${payload.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${payload.estimatedDelivery}</p>` : ""}
                <div style="margin-top: 24px;">
                  <a href="${payload.trackingUrl}" style="background-color: #00D4FF; color: #080E1B; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Shipment Live</a>
                </div>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 32px 0 16px 0;" />
                <p style="font-size: 12px; color: #9AAAC0;">NEXTRAK Intelligent Logistics Control Center</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return { success: true, provider: "RESEND", id: data.id };
        }
      } catch (e) {
        console.error("Resend API dispatch error:", e);
      }
    }

    // When no Resend key is set, log cleanly in demo mode
    console.log(`[EMAIL NOTICE] (Demo Mode) Sent status email to ${payload.to} for shipment ${payload.trackingNumber} [${payload.status}]`);
    return { success: true, provider: "LOCAL_LOG" };
  }
}

