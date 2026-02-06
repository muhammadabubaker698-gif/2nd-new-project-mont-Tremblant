import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Simple pricing for demo (CAD cents). Replace with your advanced pricing later.
const PRICES: Record<string, number> = {
  escalade: 15000, // $150.00
  suburban: 9500,  // $95.00
  sprinter: 25000, // $250.00
};

export async function POST(req: Request) {
  const { email, pickup, dropoff, datetime, vehicle } = await req.json();

  const unit_amount = PRICES[vehicle] ?? 15000;

  try {
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Luxury Limo Booking (${vehicle})`,
              description: `Pickup: ${pickup} | Drop-off: ${dropoff} | Date/Time: ${datetime}`,
            },
            unit_amount,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
}
