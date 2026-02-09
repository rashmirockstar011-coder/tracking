# 📧 Email Reminders Setup Guide

## Quick Setup

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Click **"API Keys"** in the dashboard
3. Create a new API key
4. Copy it to your `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

### 2. Add Cron Secret

Generate a random string for security:
```env
CRON_SECRET=any_random_string_here_12345
```

### 3. Deploy to Vercel

The cron job **only works on Vercel** (not localhost). After deploying:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add both variables:
   - `RESEND_API_KEY`
   - `CRON_SECRET`
3. Redeploy your app

### 4. Verify Cron is Running

1. Go to Vercel Dashboard → Your Project → Crons
2. You should see: `/api/cron/send-reminders` scheduled to run every hour (`0 * * * *`)

## How It Works

- **Cron Schedule**: Runs every hour (at minute 0)
- **Checks**: All reminders that are:
  - Not completed
  - Have email enabled
  - Are past their due time
  - Haven't been sent yet
- **Sends**: Email to `useiteverywhereboy@gmail.com`
- **Marks**: Reminder as sent so it doesn't send again

## Testing

### Test the Cron Endpoint Manually

```bash
curl -X GET https://your-app.vercel.app/api/cron/send-reminders \
  -H "Authorization: Bearer your_cron_secret_here"
```

### Create a Test Reminder

1. Create a reminder with a datetime in the past
2. Enable email notification
3. Wait for the next hour, or trigger manually using the curl command above
4. Check your email!

## Resend Free Tier Limits

- **100 emails/day** for free
- **From address**: Will use `onboarding@resend.dev` (default)
- To use your own domain, verify it in Resend dashboard

## Customizing Email

To change the email sender or template, edit:
`src/app/api/cron/send-reminders/route.js`

```javascript
await resend.emails.send({
  from: 'Rashii <your@domain.com>', // Change this
  to: 'useiteverywhereboy@gmail.com',
  subject: `⏰ Reminder: ${reminder.title}`,
  html: `...` // Customize the HTML
});
```

## Troubleshooting

❌ **Emails not sending?**
- Check Vercel cron logs in Dashboard
- Verify `RESEND_API_KEY` is set correctly
- Make sure reminder datetime is in the past
- Confirm `emailNotify` is `true`

❌ **Cron not running?**
- Vercel crons only work on deployed apps (not localhost)
- Check Vercel Dashboard → Crons to see execution logs

✅ **Working correctly?**
- You'll receive emails at the specified time
- The `emailSentAt` field in Firestore will be populated
- Cron logs will show successful sends

---

Made with 💕 for Shiv & Vaishnavi
