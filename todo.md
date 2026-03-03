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
