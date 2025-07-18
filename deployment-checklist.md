# Quick Deployment Checklist

## Pre-Deployment Checklist

- [ ] **Code is ready and tested locally**
  - [ ] Run `npm run build` successfully
  - [ ] No TypeScript errors
  - [ ] Application works with local database

- [ ] **Environment variables prepared**
  - [ ] Have Supabase URL ready
  - [ ] Have Supabase Anon Key ready
  - [ ] `.env.local` file created for local development

- [ ] **Accounts created**
  - [ ] GitHub account
  - [ ] Vercel account
  - [ ] Supabase account

## Supabase Setup (15 minutes)

- [ ] Create new Supabase project
- [ ] Run database schema SQL
- [ ] Copy Project URL
- [ ] Copy Anon Key
- [ ] Test connection with Table Editor

## GitHub Setup (5 minutes)

- [ ] Create new repository
- [ ] Push code to GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin [your-repo-url]
  git push -u origin main
  ```

## Vercel Deployment (10 minutes)

- [ ] Import GitHub repository to Vercel
- [ ] Add environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `APP_ENV` = `production`
- [ ] Deploy application
- [ ] Test deployed URL

## Post-Deployment Verification

- [ ] Application loads without errors
- [ ] Can create a new garden
- [ ] Can add plant beds
- [ ] Visual garden designer works
- [ ] No console errors in browser

## If Issues Occur

1. **White screen/Environment errors**:
   - [ ] Check environment variables in Vercel dashboard
   - [ ] Redeploy with cleared cache
   - [ ] Visit `/api/debug/env?key=debug-env-vars-2024`

2. **Database errors**:
   - [ ] Verify Supabase project is active
   - [ ] Check RLS policies
   - [ ] Verify table structure

3. **Build failures**:
   - [ ] Check Vercel build logs
   - [ ] Run `npm run build` locally
   - [ ] Check all dependencies are saved

## Emergency Fixes Applied

Your code now includes:
1. ✅ Emergency fallback configuration in `lib/supabase.ts`
2. ✅ Debug endpoint at `/api/debug/env`
3. ✅ Enhanced error logging
4. ✅ `.env.local` file for local development

## Next Steps After Deployment

1. Remove emergency fallback once proper env vars are set
2. Set up custom domain (optional)
3. Configure backups in Supabase
4. Add authentication (optional)
5. Set up monitoring

---

**Total deployment time: ~30 minutes**

**Support**: 
- Vercel Discord: https://vercel.com/discord
- Supabase Discord: https://discord.supabase.com
- Check `cloud-deployment-guide.md` for detailed instructions