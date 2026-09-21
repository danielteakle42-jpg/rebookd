# Rebookd — production-connected build

This version is connected to the dedicated live Supabase project for Rebookd. Customer authentication, profiles, businesses, services, availability, bookings, favourites, notifications, waitlists, reviews, verification records, disputes and payout records are backed by Supabase with RLS.

## Already live
- Dedicated Rebookd Supabase project in London region (eu-west-2)
- Auth-ready user profiles
- Business/customer roles and permissions
- General marketplace categories for any appointment-based business
- Services, classes/capacity and last-minute availability
- Atomic booking reservation function to reduce double booking
- Cancellations that restore availability
- Reviews and rating recalculation
- Storage buckets for public media and private verification docs
- Notification records
- Stripe-ready payment/payout fields
- Stripe Connect/Checkout/Webhook server endpoints
- Resend-ready transactional booking email endpoint

## Required Vercel environment variables before real payments/email
Copy `.env.example` into the project environment and fill in the secret values. Never put service-role, Stripe secret, webhook or Resend keys in browser JavaScript.

## Stripe
Create a Stripe Connect platform, set `STRIPE_SECRET_KEY`, configure `/api/stripe-webhook` as a webhook endpoint, and set `STRIPE_WEBHOOK_SECRET`. Business owners can then onboard their payout account and customer checkout can route funds with a platform fee.

## Email
Verify a Rebookd-owned sending domain in Resend, set `RESEND_API_KEY` and `REBOOKD_FROM_EMAIL`. The currently connected Resend account does not yet have a verified Rebookd domain, so production email should not be enabled until that exists.

## Important
The public browser key in `app.js` is intentionally publishable. Server secrets belong only in Vercel environment variables.
