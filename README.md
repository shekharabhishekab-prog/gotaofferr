# Terbey

AI resume and cover letter tailoring, plus job search. Site: https://terbey.com

## Stack
- TanStack Start (React, TypeScript), deployed as a Cloudflare Worker
- Supabase for the database and sign-in (Google and email)
- Razorpay for payments, Resend for email, Firecrawl for job search, Gemini for AI

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values (never commit `.env`)
3. `npm run dev`

## Secrets
Server keys live only in Cloudflare Worker secrets. Nothing secret belongs in this repo.

## Previews
Branch pushes build a preview version on Cloudflare; main deploys to production.


Preview build check 2.

Preview rebuild 3.

Logs on.
