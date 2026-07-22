#!/usr/bin/env node

/**
 * Generate Demo Claim for RRCA Pitch
 * Creates a realistic claim and generates forensic dossier
 */

import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
});

async function generateDemoClaim() {
  try {
    console.log('Generating demo claim for RRCA pitch...\n');

    // Create demo user if needed
    const userResult = await db.execute({
      sql: `SELECT id FROM users WHERE email = 'demo@consciousclai ms.com' LIMIT 1`,
      args: [],
    });

    let userId;
    if (userResult.rows.length === 0) {
      console.log('Creating demo user...');
      const createUserResult = await db.execute({
        sql: `INSERT INTO users (email, name, role) VALUES (?, ?, ?) RETURNING id`,
        args: ['demo@consciousclai ms.com', 'Demo User', 'user'],
      });
      userId = createUserResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    console.log(`User ID: ${userId}\n`);

    // Create demo job/claim
    console.log('Creating demo claim...');
    const jobResult = await db.execute({
      sql: `INSERT INTO jobs (
        userId, propertyAddress, homeownerName, claimNumber, 
        insuranceCarrier, adjusterName, adjusterEmail, adjusterPhone,
        dateOfLoss, notes, status, tradeType, feePercentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`,
      args: [
        userId,
        '1234 Hail Storm Lane, Denver, CO 80202',
        'John Smith',
        'CC-2026-001',
        'XYZ Insurance',
        'Jane Doe',
        'jane.doe@xyzinsurance.com',
        '(303) 555-0123',
        new Date('2026-03-15').toISOString(),
        'Severe hail damage to roof structure. Multiple missing shingles, decking damage, collateral water intrusion.',
        'draft',
        'roofing',
        '12.00'
      ],
    });

    const jobId = jobResult.rows[0].id;
    console.log(`Job ID: ${jobId}\n`);

    // Log the demo claim details
    console.log('=' .repeat(60));
    console.log('DEMO CLAIM CREATED');
    console.log('=' .repeat(60));
    console.log(`Property: 1234 Hail Storm Lane, Denver, CO 80202`);
    console.log(`Insured: John Smith`);
    console.log(`Claim #: CC-2026-001`);
    console.log(`Adjuster: Jane Doe, XYZ Insurance`);
    console.log(`Loss Type: Hail Damage`);
    console.log(`Roof Area: 3,200 sq ft`);
    console.log(`Pitch: 6/12`);
    console.log(`Initial Estimate: $8,500`);
    console.log(`Additional Items Found: $4,832`);
    console.log(`Total RCV: $13,332`);
    console.log(`Depreciation: 20%`);
    console.log(`Net ACV: $10,666`);
    console.log('=' .repeat(60));
    console.log(`\nJob created successfully!`);
    console.log(`Access at: /jobs/${jobId}/forensic-dossier\n`);

  } catch (error) {
    console.error('Error generating demo claim:', error);
    process.exit(1);
  }
}

generateDemoClaim();
