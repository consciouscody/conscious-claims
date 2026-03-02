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
- [ ] Stripe payment processing for fee collection
- [ ] Code reference library page (/reference)
