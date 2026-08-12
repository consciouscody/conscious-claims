/**
 * WARDEN Agent - Field Operations for Data Center Commissioning
 * Serves: John McCain on job sites
 * Lives: ElevenLabs voice + chat interface
 * Purpose: Keep field operations organized, documented, and audit-ready
 */

interface LOTOEntry {
  id: string;
  equipmentId: string;
  location: string;
  building: string;
  closedBy: string;
  timestamp: Date;
  status: "energized" | "de-energized";
  verified: boolean;
  verifiedBy?: string;
}

interface EnergizationEvent {
  id: string;
  equipmentName: string;
  location: string;
  voltage: number;
  time: Date;
  authorizedBy: string;
  anomalies?: string;
}

class WardenAgent {
  private lotoLog: LOTOEntry[] = [];
  private energizationLog: EnergizationEvent[] = [];
  private currentShift: Date = new Date();

  /**
   * Log a LOTO close-out entry
   */
  logLOTOCloseout(
    equipmentId: string,
    location: string,
    building: string,
    closedBy: string,
    status: "energized" | "de-energized",
    verified: boolean,
    verifiedBy?: string
  ): LOTOEntry {
    const entry: LOTOEntry = {
      id: `LOTO-${Date.now()}`,
      equipmentId,
      location,
      building,
      closedBy,
      timestamp: new Date(),
      status,
      verified,
      verifiedBy,
    };

    this.lotoLog.push(entry);

    // Confirmation message (short for field work)
    console.log(
      `✓ LOTO logged: ${equipmentId} at ${location} (${building}) - Status: ${status} - Verified: ${verified ? "Yes" : "No"}`
    );

    return entry;
  }

  /**
   * Log an energization event
   */
  logEnergizationEvent(
    equipmentName: string,
    location: string,
    voltage: number,
    authorizedBy: string,
    anomalies?: string
  ): EnergizationEvent {
    const event: EnergizationEvent = {
      id: `ENER-${Date.now()}`,
      equipmentName,
      location,
      voltage,
      time: new Date(),
      authorizedBy,
      anomalies,
    };

    this.energizationLog.push(event);

    // Confirmation (short)
    const anomalyNote = anomalies ? ` | Anomalies: ${anomalies}` : "";
    console.log(
      `✓ Energization logged: ${equipmentName} @ ${voltage}V by ${authorizedBy}${anomalyNote}`
    );

    return event;
  }

  /**
   * Generate daily summary for end of shift
   */
  generateDailySummary(): string {
    const todayLOTO = this.lotoLog.filter((entry) => this.isToday(entry.timestamp));
    const todayEnergization = this.energizationLog.filter((event) =>
      this.isToday(event.time)
    );

    const unverifiedLOTOs = todayLOTO.filter((l) => !l.verified);
    const gaps = unverifiedLOTOs.length > 0 ? `ALERT: ${unverifiedLOTOs.length} unverified LOTOs` : "All LOTOs verified";

    const summary = `
=== WARDEN DAILY SUMMARY ===
Date: ${new Date().toLocaleDateString()}

LOTO ACTIVITY:
- Total close-outs: ${todayLOTO.length}
- Verified: ${todayLOTO.filter((l) => l.verified).length}
- Unverified: ${unverifiedLOTOs.length}
${unverifiedLOTOs.map((l) => `  ! ${l.equipmentId} at ${l.location}`).join("\n")}

ENERGIZATION EVENTS:
- Total events: ${todayEnergization.length}
${todayEnergization.map((e) => `  ${e.equipmentName} @ ${e.voltage}V (Auth: ${e.authorizedBy})`).join("\n")}

AUDIT STATUS: ${gaps}

Ready for John to copy to tracking sheet or team email.`;

    return summary;
  }

  /**
   * Audit readiness check
   */
  auditReadiness(): { ready: boolean; flags: string[] } {
    const flags: string[] = [];

    const todayLOTO = this.lotoLog.filter((entry) => this.isToday(entry.timestamp));
    const todayEnergization = this.energizationLog.filter((event) =>
      this.isToday(event.time)
    );

    // Check for unverified LOTOs
    const unverified = todayLOTO.filter((l) => !l.verified);
    if (unverified.length > 0) {
      flags.push(`${unverified.length} unverified LOTO close-outs`);
    }

    // Check for energization events without authorization
    const unauthorized = todayEnergization.filter((e) => !e.authorizedBy);
    if (unauthorized.length > 0) {
      flags.push(`${unauthorized.length} energization events missing authorization`);
    }

    // Check for anomalies flagged
    const anomalies = todayEnergization.filter((e) => e.anomalies);
    if (anomalies.length > 0) {
      flags.push(`${anomalies.length} anomalies noted in energization`);
    }

    return {
      ready: flags.length === 0,
      flags,
    };
  }

  /**
   * Helper: check if date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /**
   * Get LOTO log (for Relay to write to Sheets)
   */
  getLOTOLog(): LOTOEntry[] {
    return this.lotoLog;
  }

  /**
   * Get energization log (for Relay to write to Smartsheet)
   */
  getEnergizationLog(): EnergizationEvent[] {
    return this.energizationLog;
  }

  /**
   * Answer procedure questions (OSHA, NFPA 70E, etc.)
   */
  answerProcedureQuestion(question: string): string {
    // Simplified responses - in production these would reference actual standards
    const responses: { [key: string]: string } = {
      loto: "LOTO procedures must be followed per NFPA 70E. Lock-out valid for up to 3 days. Close-out must be logged immediately upon de-energization.",
      energization:
        "Energization must be authorized and documented. All equipment status changes must be logged with time, voltage, and authorizing person.",
      nfpa70e:
        "NFPA 70E is the standard for electrical safety in the workplace. Verify current requirements with your authority having jurisdiction.",
    };

    for (const [key, response] of Object.entries(responses)) {
      if (question.toLowerCase().includes(key)) {
        return response;
      }
    }

    return "For specific NFPA 70E or OSHA procedure questions, verify with the authority having jurisdiction. If uncertain, consult the project's safety officer.";
  }
}

// Export for use
export default WardenAgent;

// Example usage
if (require.main === module) {
  const warden = new WardenAgent();

  // Simulate field logging
  warden.logLOTOCloseout("BR-001-MTR", "Building A, Row 3", "Building A", "John McCain", "de-energized", true, "Lead Tech");
  warden.logEnergizationEvent("UPS-A1", "Building A, Room 101", 480, "John McCain");
  warden.logLOTOCloseout("BR-002-MTR", "Building B, Row 1", "Building B", "Tech Davis", "energized", false);

  console.log(warden.generateDailySummary());
  console.log(warden.auditReadiness());
}
