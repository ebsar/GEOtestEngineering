# Static CMS Publishing

The public website does not query Supabase. It reads `public/cms-snapshot.json` and images copied into
`public/cms-media/` during deployment.

## Vercel setup

1. Keep `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the Vercel project. They are used only by the editor,
   the authenticated publish endpoint, and the build-time snapshot script.
2. In Vercel, create a Deploy Hook for the production branch.
3. Add the hook URL as the server-only environment variable `VERCEL_DEPLOY_HOOK_URL`.
4. Redeploy once so the publish endpoint and static snapshot build are active.

## Editing workflow

1. Sign in at `/edit` and make all required changes.
2. Confirm the changes in the editor preview.
3. Press **Publish website** once.
4. Vercel builds a new deployment. During that build, `npm run cms:sync` reads the published CMS rows,
   downloads their images, and packages both into the website.

After deployment finishes, public visitors use only the deployed snapshot and local image files. Supabase
can pause without affecting the public website. If snapshot generation or an image download fails, the build
fails instead of deploying missing content, so the currently live deployment remains unchanged.
