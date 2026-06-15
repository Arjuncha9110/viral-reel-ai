import { jsonResponse } from "../../_lib/prokerala";

interface Env {
  PADDLE_API_KEY?: string;
  PADDLE_ENVIRONMENT?: string;
}

export const onRequestPost: PagesFunction<Env> = async () => {
  return jsonResponse(
    {
      status: "error",
      message:
        "Paddle checkout is not enabled yet. Use Razorpay, PayPal, or Stripe until a real Paddle transaction verification flow is implemented.",
    },
    { status: 501 },
  );
};
