import { jsonResponse } from "../../_lib/prokerala";
import { isLocalRequest } from "../../_lib/crypto";

type RazorpayOrderRequest = {
  amount?: number;
  currency?: string;
  plan?: "basic" | "detailed" | "sade-sati";
};

const expectedAmountInr = (plan: RazorpayOrderRequest["plan"]) => {
  if (plan === "detailed") return 999;
  if (plan === "sade-sati") return 399;
  return 299;
};

export const onRequestPost: PagesFunction<{
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
}> = async ({ request, env }) => {
  try {
    const { amount, currency = "INR", plan = "basic" } = (await request.json()) as RazorpayOrderRequest;
    const expectedAmount = expectedAmountInr(plan);

    if (currency !== "INR") {
      return jsonResponse({ status: "error", message: "Invalid currency." }, { status: 400 });
    }

    if (amount !== expectedAmount) {
      return jsonResponse({ status: "error", message: "Invalid payment amount." }, { status: 400 });
    }

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      if (!isLocalRequest(request)) {
        return jsonResponse({ status: "error", message: "Razorpay is not configured." }, { status: 500 });
      }
      return jsonResponse({ status: "success", orderId: `order_dev_${Date.now()}` });
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: expectedAmount * 100,
        currency,
        receipt: `dp_${plan}_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      return jsonResponse({ status: "error", message: "Failed to create payment order." }, { status: 502 });
    }

    const data = (await response.json()) as { id?: string };
    if (!data.id) {
      return jsonResponse({ status: "error", message: "Payment order ID missing." }, { status: 502 });
    }

    return jsonResponse({ status: "success", orderId: data.id });
  } catch {
    return jsonResponse({ status: "error", message: "Server error." }, { status: 500 });
  }
};
