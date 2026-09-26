# Contact Form Email Setup

The contact form sends through the Vercel function at `/api/contact`. It does not use Supabase.

## Required Vercel variables

- `RESEND_API_KEY`: API key from Resend.
- `CONTACT_FROM_EMAIL`: sender using a verified Resend domain, for example
  `GEOtest Website <website@geotestengineering.com>`.
- `CONTACT_TO_EMAIL`: optional recipient override. It defaults to
  `geotestengineering.ks@gmail.com`.

For an initial Resend test, `GEOtest Website <onboarding@resend.dev>` can be used only when Resend allows
delivery to the email address belonging to that Resend account. Verify a company domain before accepting
production requests.

After adding the variables, redeploy the Vercel project and submit one real test request from `/contact`.
