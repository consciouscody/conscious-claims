# Forensic Dossier System Build - TODO

## Phase 1: Rebuild Job Creation Flow
- [ ] Remove all "supplement" references from job creation
- [ ] Update job form to capture claim-specific data (claim #, adjuster, policy #, type of loss, date of loss)
- [ ] Rename "Create Supplement" to "Create Claim"
- [ ] Update dashboard to show "Claims Dashboard" instead of "Supplement Dashboard"
- [ ] Update all CTA buttons from "Upload Your First Job" to "Create Your First Claim"

## Phase 2: Build 14-Section Forensic Dossier Generator
- [ ] Create dossier data model (14 sections)
- [ ] Build Section 1: Title Slide (property address, insured, adjuster, claim #, prepared by, document ID)
- [ ] Build Section 2: Insured Information & Claim Metadata
- [ ] Build Section 3: Financial Resolution Summary (RCV, depreciation, ACV)
- [ ] Build Section 4: Manufacturer Warranty Mandates
- [ ] Build Section 5: Waste Factor Justification Table
- [ ] Build Section 6: Scope Breakdown (Treemap visualization)
- [ ] Build Section 7: Itemized Cost Breakdown
- [ ] Build Section 8: Collateral Component Failures (with photo gallery)
- [ ] Build Section 9: Water Intrusion Diagram
- [ ] Build Section 10: Nail Failure Mechanism Diagram
- [ ] Build Section 11: Decking Gap & Structural Deficiency Evidence
- [ ] Build Section 12: Timeline (damage events, degradation, triggering loss)
- [ ] Build Section 13: Property Measurements
- [ ] Build Section 14: Final Claim Authorization Request
- [ ] Wire all sections to tRPC procedures

## Phase 3: Photo Upload & Storage
- [ ] Build photo upload component
- [ ] Integrate S3 storage for photos
- [ ] Create photo gallery view
- [ ] Add photo metadata (date, location, damage type)
- [ ] Build photo tagging system (roof damage, decking gap, vents, flashing, interior, etc.)

## Phase 4: Cost Calculator & Waste Factors
- [ ] Create cost database (materials, labor rates)
- [ ] Build waste factor calculator (underlayment 10-15%, drip edge 10-12%, starter strips 5-10%, shingles 10-15%+)
- [ ] Build manufacturer specs database (TAMKO, Owens Corning, etc.)
- [ ] Create cost breakdown by category (roofing, masonry, gutters, demo/labor)
- [ ] Build treemap visualization for scope breakdown

## Phase 5: PDF Generation
- [ ] Integrate PDF generation library (ReportLab or similar)
- [ ] Build PDF template matching EagleView/RoofR aesthetic
- [ ] Add all 14 sections to PDF
- [ ] Add photos to PDF
- [ ] Add diagrams to PDF
- [ ] Test PDF output quality

## Phase 6: EagleView Integration
- [ ] Set up EagleView API connector
- [ ] Build property measurement pulling (roof area, pitch, complexity, perimeter)
- [ ] Build photo pulling from EagleView
- [ ] Auto-populate property measurements in dossier
- [ ] Handle EagleView API errors gracefully

## Phase 7: Xactimate Integration
- [ ] Set up Xactimate API connector
- [ ] Build PDF extraction from Xactimate estimates
- [ ] Build line item parsing (extract costs, materials, labor)
- [ ] Auto-populate cost data in dossier
- [ ] Handle Xactimate API errors gracefully

## Phase 8: Testing & Deployment
- [ ] Test end-to-end workflow (create claim → upload photos → generate dossier → download PDF)
- [ ] Test with sample claims
- [ ] Test PDF output quality
- [ ] Test photo upload and storage
- [ ] Test EagleView integration (if API keys available)
- [ ] Test Xactimate integration (if API keys available)
- [ ] Save final checkpoint
- [ ] Deploy to production

## Supporting Files
- `/home/ubuntu/FORENSIC_DOSSIER_SPEC.md` — Complete specification
- `/home/ubuntu/ROOFUS_AUDIT_TEMPLATE.md` — RoofUS audit template
- `/home/ubuntu/MATT_JACKSON_EMAIL.md` — Email draft for Matt Jackson
- `/home/ubuntu/roofus-pitch-deck/` — 12-slide pitch deck (Roof U.S. branded)
