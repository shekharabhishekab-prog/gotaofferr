# Tailor Resume AI

i want an app that  rewrite the resume in pdf format and here is the context ( so when we are applying jobs in many companies, brand and org so we have to rewrite or rebuild over own defalt resume according to that campany job description ) so i want we have to just give ai to our own defalt resume and the Job description of that company, brand and any org so that ai rebuild the whole resume according to that company Job descriton and role for that postion and give a new resume so that people can apply easily apply jobs in that brand ,company and org and with the cover letter

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://resumemakerr.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/224ae01b-cc1a-49d9-b757-c96ec9ff2ff9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Security & secrets

- All credentials live in environment variables. See `.env.example` for the full list; only `VITE_*` values are safe for the browser.
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `JOB_ALERTS_CRON_SECRET` and `ANON_HASH_SALT` are server-only and must never appear in client code.
- If any secret was ever hardcoded in a commit, it still exists in git history — rotate that value immediately, it is not enough to delete the line.
