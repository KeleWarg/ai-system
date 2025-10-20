# Production Checklist

Use this checklist to ensure your AI Design System is production-ready before deploying.

## Pre-Deployment

### Code Quality
- [x] All TypeScript types properly defined
- [x] No TypeScript errors (`npm run build`)
- [x] ESLint passing
- [x] All tests passing (Parts 1-9)
- [x] Environment variables documented
- [x] Sensitive data not committed to git

### Database Setup
- [ ] Supabase project created
- [ ] Database schema deployed (`database/schema.sql`)
- [ ] RLS policies enabled and tested
- [ ] At least one admin user created
- [ ] Admin user role set to 'admin' in database
- [ ] Test data added (optional, for demo)

### API Keys
- [ ] Anthropic API key obtained
- [ ] Anthropic API key tested locally
- [ ] API key has sufficient credits/quota
- [ ] Supabase keys copied (URL, anon, service_role)

### Local Testing
- [ ] `npm run dev` works without errors
- [ ] Can login at `/admin/login`
- [ ] Can create themes
- [ ] Can upload spec sheet and generate component
- [ ] Public docs accessible at `/docs/components`
- [ ] Registry API works: `/api/registry`
- [ ] MCP Server works: `/api/mcp`
- [ ] llms.txt works: `/llms.txt`

## Deployment

### Vercel Setup
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged in (`vercel login`)
- [ ] Preview deployment created (`vercel`)
- [ ] Preview deployment tested

### Environment Variables
Set in Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
- [ ] `ANTHROPIC_API_KEY` (keep secret!)
- [ ] `NEXT_PUBLIC_SITE_URL`

After adding variables:
- [ ] Redeployed with new environment variables
- [ ] Tested environment variables are working

### Production Deployment
- [ ] Production deployment created (`vercel --prod`)
- [ ] Production URL obtained
- [ ] Updated `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Redeployed with correct URL

## Post-Deployment Testing

### Functional Testing
- [ ] Homepage loads: `https://your-site.com`
- [ ] Admin login works: `https://your-site.com/admin/login`
- [ ] Can access admin dashboard
- [ ] Can create/edit themes
- [ ] Can create components via spec upload
- [ ] Components appear in public docs
- [ ] Code copy button works
- [ ] Theme switching works (real-time)

### API Testing
Test all API endpoints:

```bash
SITE="https://your-site.com"

# Registry API - should return JSON with components list
curl $SITE/api/registry

# MCP Server - should return JSON with tools
curl $SITE/api/mcp

# llms.txt - should return plain text
curl $SITE/llms.txt

# Individual component (if exists)
curl $SITE/api/registry/button
```

- [ ] Registry API returns component list
- [ ] MCP Server returns tools definition
- [ ] llms.txt returns formatted text
- [ ] Individual component endpoint works (404 if no components yet)

### AI Tool Integration
- [ ] v0.dev can access registry
- [ ] Claude Desktop can use MCP server (if configured)
- [ ] Cursor can access docs
- [ ] llms.txt is publicly accessible

### Performance
- [ ] Homepage loads in < 3 seconds
- [ ] Component pages load in < 2 seconds
- [ ] API responses in < 1 second
- [ ] Theme switching is instant
- [ ] No console errors in browser

### Security
- [ ] Service role key NOT exposed in client
- [ ] Anthropic API key NOT exposed in client
- [ ] Admin routes protected by middleware
- [ ] RLS policies prevent unauthorized access
- [ ] CORS headers configured correctly
- [ ] No sensitive data in API responses

## Optional Enhancements

### GitHub Integration
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel connected to GitHub
- [ ] CI/CD working (auto-deploy on push)
- [ ] README updated with deployment URL

### Custom Domain
- [ ] Custom domain purchased
- [ ] Domain added in Vercel
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] `NEXT_PUBLIC_SITE_URL` updated to custom domain
- [ ] Redeployed

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring (optional: UptimeRobot)
- [ ] API rate limiting considered

### Documentation
- [ ] README updated with live URL
- [ ] Usage examples added
- [ ] API documentation published
- [ ] Team onboarding guide created

## Launch

### Communication
- [ ] Team notified of deployment
- [ ] Demo session scheduled
- [ ] Documentation shared
- [ ] Feedback collection method set up

### Initial Content
- [ ] At least 3 themes created
- [ ] At least 5 components generated
- [ ] Components categorized correctly
- [ ] Component prompts tested
- [ ] Screenshots taken for marketing

## Maintenance

### Regular Tasks
- [ ] Monitor Vercel analytics weekly
- [ ] Check Anthropic API usage monthly
- [ ] Review Supabase database size monthly
- [ ] Update dependencies quarterly
- [ ] Review and update RLS policies as needed

### Backup Strategy
- [ ] Supabase automatic backups enabled
- [ ] Component code backed up separately
- [ ] Theme configurations documented
- [ ] Recovery procedure documented

## Troubleshooting Resources

If issues arise:
1. Check Vercel function logs
2. Check Supabase logs
3. Review `DEPLOYMENT.md` guide
4. Test locally with same environment variables
5. Check browser console for client-side errors

## Success Criteria

Your deployment is successful when:
- ✅ All admin features work in production
- ✅ Users can browse and copy components
- ✅ AI tools can access your APIs
- ✅ No critical errors in logs
- ✅ Team can use the system effectively

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Last Updated**: `date`

**Deployed By**: `name`

**Production URL**: `https://your-site.com`

