import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, invoice } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create line item based on whether it's onboarding or invoice payment
    const lineItem = invoice ? {
      price_data: {
        currency: 'usd',
        product_data: { 
          name: `Invoice for ${invoice.clientName}`,
          description: `PayNapple Invoice - ${invoice.clientName}`
        },
        unit_amount: Math.round(invoice.amount * 100)
      },
      quantity: 1
    } : {
      price_data: {
        currency: 'usd',
        product_data: { 
          name: 'PayNapple Onboarding',
          description: 'One-time access fee to PayNapple invoicing platform'
        },
        unit_amount: 900 // $9.00
      },
      quantity: 1
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [lineItem],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}`,
      metadata: invoice ? { 
        invoiceId: invoice.id,
        type: 'invoice'
      } : { 
        type: 'onboarding',
        userName: name
      }
    });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});