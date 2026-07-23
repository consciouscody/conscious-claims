# SupplementAI - Project TODO

## Database & Backend
- [x] Database schema: jobs, supplement_items, photos, supplement_line_items, notifications
- [x] tRPC router: jobs CRUD
- [x] tRPC router: supplement item detection logic
- [x] tRPC router: PDF upload and parsing
- [x] tRPC router: photo upload to S3
- [x] tRPC router: LLM adjuster email generation
- [x] tRPC router: supplement status updates
- [x] tRPC router: payment calculator
- [x] Supplement items knowledge base (all Xactimate codes, justifications)

## Frontend Pages
- [x] Landing page (marketing, CTA, feature highlights)
- [x] Dashboard (job list, stats overview)
- [x] New job creation form
- [x] Job detail page (tabs: Estimate, Photos, Supplement, Email, Payment)
- [x] Supplement item checklist / detection results UI
- [x] Supplement report view (line items, codes, justifications)
- [x] Adjuster email draft editor
- [x] Status tracking UI (submitted, approved, denied)
- [x] Payment calculator UI
- [ ] Building code reference database page

## Features
- [x] PDF upload and Xactimate line item extraction
- [x] Photo upload and management
- [x] Automated supplement item detection (rules engine)
- [x] AI photo analysis for supplement evidence
- [x] LLM-generated adjuster rebuttal emails
- [x] Supplement status tracking
- [x] Percentage-based payment calculator (10-15%)
- [ ] Notification alerts (status changes) - future
- [ ] Building code and manufacturer reference database page - future

## Polish & Testing
- [x] Responsive design (mobile-friendly)
- [x] Vitest unit tests (17 tests passing)
- [x] Error handling and loading states
- [x] Empty states for all major sections

## Future Enhancements
- [ ] EagleView integration
- [ ] SMS/email notifications on status change
- [ ] Bulk supplement report PDF export
- [ ] Client portal for homeowners
- [x] Stripe payment processing for fee collection
- [ ] Code reference library page (/reference)

## Bug Fixes
- [x] Fix Code Reference page 404 — build the /reference page and register the route
- [x] Add Conscious Capital logo as favicon and Open Graph link preview image
- [x] Update app title and tagline to "Consciously Supplement with Confidence. Own Every Outcome."

## Stripe Integration
- [x] Install Stripe SDK and scaffold feature
- [x] Build Stripe checkout session endpoint (in-app Pay Now)
- [x] Build Stripe invoice creation and email endpoint
- [x] Build Stripe webhook for payment confirmation
- [x] Frontend: Pay Now button on approved jobs
- [x] Frontend: Payment status display and invoice trigger
- [x] Write Stripe integration tests

## Branding Fixes
- [x] Fix favicon and OG preview image — CC seal not showing when link is shared

## New Features (Phase 2)
- [x] PDF export button on Supplement tab — download supplement report as PDF
- [x] Add "Export Report" button to the supplement tab header

## New Features (Phase 3)
- [x] /pricing page with monthly/annual tiers and Stripe subscription checkout
- [x] Team/About section on landing page with Cody's photos and founder story
- [x] /demo page with pre-filled sample job accessible without login
- [x] View Demo button on home page wired to /demo
- [x] Owner notifications on new job creation and status changes (approved/denied/paid/submitted)
- [x] Pricing nav link in header and footer
- [x] OG image CDN fix — CC seal shows when sharing link
- [x] Correct domain (conscioussupplements.com) in og:url meta tag

## Bug Fixes (Phase 3)
- [x] Favicon not showing on live site — /favicon.ico returns 204, fix via CDN URL in link tag
- [x] Stage photo crop in Team section — face not visible, only top of head showing

## Bug Fixes (Phase 4)
- [x] Sign In button and nav links on landing page not working — confirmed working, was showing Go to Dashboard because user was already logged in

## SEO Fixes
- [x] Meta description too long (171 chars) — trimmed to 138 characters
- [x] No meta keywords tag — added 10 targeted roofing supplement keywords

## Bug Fixes (Phase 5)
- [x] Sign In button and all nav links broken on live published site — confirmed working on live site: Sign In → Manus login, Pricing → /pricing, View Demo → /demo, all buttons navigate correctly

## E-Book Lead Magnet Funnel
- [x] Write full e-book content: "The Roofing Contractor's Supplement Playbook"
- [x] Generate professional e-book cover image (CC brand, dark navy + orange)
- [x] Export e-book as polished PDF with cover, chapters, and CTAs
- [x] Build /free-guide lead capture landing page with email form
- [x] Wire email capture to store leads in database
- [x] Instant PDF download link delivered after email submission
- [x] Write 3-email automated follow-up sequence
- [x] Write Facebook group post copy (4 versions for different groups)
- [x] Add /free-guide link to main nav and landing page hero CTA

## Bug Fixes (Phase 6)
- [x] PDF upload broken — getDocument error "no 'url' parameter provided" — fixed: PDFParse requires data in constructor options, getText returns {pages:[]} not string, both corrected

## Phase 7 — Follow-Up Features
- [ ] LLM fallback in PDF parser for bulletproof line item detection on any Xactimate format
- [ ] Admin leads dashboard — view all e-book downloads with name, email, company, phone, date
- [ ] Admin route protection (owner-only access to leads dashboard)

## Storm the Door — Paid Sales Playbook ($27)
- [x] Write full e-book content using Cody's real door pitches and frame control tactics
- [x] Generate professional cover (dark, aggressive, Conscious Capital branded)
- [x] Build polished PDF with cover, all chapters, and SupplementAI CTA
- [x] Build /storm-the-door purchase page with Stripe $27 checkout
- [x] Build /storm-the-door/success page with PDF download after payment
- [x] Add createEbookCheckout, getEbookAccess, getEbookDownload to stripeRouter

## Storm the Door — Guest Checkout
- [x] Remove login requirement from /storm-the-door — allow guest Stripe checkout without account
- [x] Add guest checkout procedure to stripeRouter (no auth required)
- [ ] Post to LinkedIn, Facebook, Instagram after publish

## CRM Integration (Phase 8)
- [x] Add crmIntegrations table to schema (userId, crmType, apiKey, webhookSecret, status, lastSyncAt)
- [x] Add crmSyncedJobs table to track which CRM jobs have been imported (handled via notes field)
- [x] Build CRM router: connect, disconnect, test connection, sync jobs
- [x] Build /api/crm/webhook endpoint to receive job data from any CRM via Zapier
- [x] Build native JobNimbus API sync (pull jobs by API key)
- [x] Build native AccuLynx API sync (pull jobs by API key)
- [x] Build Integrations settings page in dashboard (/integrations)
- [x] Show connected CRMs, connection status, last sync time
- [x] Show unique webhook URL per user for Zapier setup
- [x] Add Zapier setup guide for each CRM (AccuLynx, JobNimbus, Roofr, Contractors Cloud)
- [x] Auto-create SupplementAI job when CRM job is received via webhook
- [x] Add CRM Integrations link in sidebar nav

## Affiliate Program (Phase 9)
- [x] Add affiliates, affiliate_clicks, affiliate_conversions tables to schema
- [x] Push schema migration to database
- [x] Build affiliate router: signup, get my stats, track click, record conversion
- [x] Build /affiliates signup page (public — anyone can apply)
- [x] Build /affiliate-dashboard (private — logged-in affiliates see stats)
- [x] Wire referral code tracking via ?ref= query param (store in localStorage, 30-day expiry)
- [x] Wire referral code into Storm the Door Stripe checkout metadata
- [ ] Wire affiliate conversion tracking into SupplementAI subscription checkout (future)
- [x] Build owner admin view of all affiliates (adminGetAll, adminApprove, adminGetConversions)
- [x] Write affiliate program terms and commission structure copy
- [x] Add Affiliates nav link to homepage
- [x] Write 30 affiliate tests — all passing

## LinkedIn Post Generator + Waitlist (Phase 10)
- [x] Add linkedin_posts table to schema (userId, topic, tone, generatedPosts, savedPost, createdAt)
- [x] Add waitlist_signups table to schema (email, name, source, createdAt)
- [x] Push schema migration
- [x] Build linkedin router: generatePosts, savePost, getMyPosts
- [x] Build waitlist router: signup (public), getCount (public), getAll (admin)
- [x] Build /linkedin-posts page in dashboard with topic input + 3 generated post options
- [x] Build /waitlist standalone landing page (public, no login needed)
- [x] Add LinkedIn Posts link to dashboard sidebar
- [x] Owner notification when someone joins waitlist

## Call-Ready Polish Sprint (Phase 11)
- [x] 4-step onboarding wizard for new contractor first login
- [x] Admin notes field per user in admin panel
- [x] UX polish: empty states, loading skeletons, professional copy throughout
- [x] Mobile responsiveness check and fixes

## Phase 12 — Call Script, Welcome Email, PDF Branding
- [x] AI cold call script generator in admin panel
- [x] Auto-welcome email when admin sets user fee
- [x] Conscious Capital branding on exported supplement PDF

## Phase 14 - Nav, Referral, Stripe
- [ ] Add Free Audit link to homepage nav
- [ ] Add Free Audit opener to call script generator
- [ ] Add Referred By field to onboarding wizard
- [ ] Wire referredBy to admin referral source tracking
- [ ] Activate Stripe checkout and billing page

## Real-Time Admin Claims Dashboard + Customer Status (Phase 15)
- [x] Add claimMessages table to schema for admin-to-customer messaging
- [x] Add allJobs admin query with user info, status, timestamps, supplement amounts
- [x] Add sendClaimMessage admin mutation
- [x] Add getMyClaimMessages customer query
- [x] Build Admin Claims Dashboard tab in AdminPanel with live feed, status badges, search/filter
- [x] Build customer Claim Status page at /claim-status showing their jobs with timeline
- [x] Auto-notify owner when new supplement is generated


## Audit Fixes (Phase 16 - CRITICAL)
- [ ] Remove visibility audit page completely
- [ ] Fix 404 errors on broken routes
- [ ] Replace "CONSCIOUS CAPITAL" with "CONSCIOUS CLAIMS" everywhere
- [ ] Fix navigation links (Pricing, Free Guide, Affiliates, Sign In)
- [ ] Fix "Get Started Free" and "Upload Your First Job" CTAs
- [ ] Fix Free Guide form validation and submission
- [ ] Remove or fix Audit form (visibility audit)
- [ ] Fix mobile responsiveness (375px, 768px viewports)
- [ ] Fix pricing page math and consistency
- [ ] Fix affiliates page commission math
- [ ] Add/fix SEO meta tags on all pages
- [ ] Fix console errors and performance issues
- [ ] Test all forms end-to-end
- [ ] Verify all links work correctly
- [ ] Test authentication flow (manus.im redirect)
- [ ] Check brand consistency across all pages
