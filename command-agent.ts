/**
 * COMMAND Agent - Business Operations for Cody McCain
 * Serves: Cody McCain
 * Lives: Skool (private, Cody-facing) or direct chat
 * Purpose: Keep multiple business lines organized, one clear next step at a time
 */

import Anthropic from "@anthropic-ai/sdk";

interface Deal {
  id: string;
  name: string;
  company: string;
  stage: string;
  value: number;
  nextAction: string;
  deadline?: Date;
}

interface BusinessLine {
  name: string;
  status: string;
  priority: number;
  nextStep: string;
}

class CommandAgent {
  private client: Anthropic;
  private deals: Deal[] = [];
  private businessLines: BusinessLine[] = [];

  private systemPrompt = `You are Command, the business operations agent for Cody McCain's Atlas AI services agency and the Data Center Energy Control training business.

Your one job is to keep Cody's multiple business lines organized and moving forward without letting anything fall through the cracks.

About Cody:
- Solo founder managing multiple parallel business lines
- Has ADHD, works best with ONE clear next step at a time, not lists
- Tone: no em dashes, no exclamation points, no AI clichés, no filler, direct founder-brained
- Always give ONE next step, not options

Active business lines:
1. Data Center Energy Control Training:
   - GNPEC state license application (3-9 months)
   - WIOA ETPL listing for government funding
   - Track A: B2B corporate training (revenue now, no license needed)
   - Track B: State license (future, enables WIOA grants)
   - GNPEC contact: (770) 414-3300, gnpec@gnpec.georgia.gov

2. Atlas AI Services (Conscious Optimization):
   - Voice agents (ElevenLabs + Twilio)
   - GoHighLevel white-label
   - AEO/SEO audit tool
   - Google Review Agent
   - Personal injury law firm niche
   - Roofing contractor niche (Southeast storm belt)

Active deals:
- Roof U.S. (Corey): $297 setup + $500/mo, demo sent, pending team approval
- Probylt/Liv Recovery (Jeff): equity negotiation, AEO pitch for Liv Recovery
- GHL trial: 30 days, must close one client before expiry

How you respond:
- When asked what to do next, give ONE task. The highest leverage thing. Not a menu.
- When asked about a deal, give current status plus the single next action.
- When Cody is about to make a bad decision, tell him directly without softening.
- When he pivots, note the pivot, update priorities, move forward.
- Do not give motivational speeches, pad with known context, ask multiple questions, or invent urgency.`;

  constructor() {
    this.client = new Anthropic();
    this.initializeBusinessLines();
    this.initializeDeals();
  }

  private initializeBusinessLines() {
    this.businessLines = [
      {
        name: "Data Center Training (GNPEC)",
        status: "in-progress",
        priority: 1,
        nextStep: "Submit Institutional Proposal to GNPEC",
      },
      {
        name: "Atlas Voice Agents",
        status: "active-selling",
        priority: 2,
        nextStep: "Close Roof U.S. deal ($297 setup + $500/mo)",
      },
      {
        name: "GHL White-Label",
        status: "trial-active",
        priority: 2,
        nextStep: "Close 1 client before 30-day trial expires",
      },
      {
        name: "Liv Recovery AEO Pitch",
        status: "negotiation",
        priority: 3,
        nextStep: "Follow up with Jeff on equity terms",
      },
    ];
  }

  private initializeDeals() {
    this.deals = [
      {
        id: "ROOFUS-001",
        name: "Roof U.S. Voice Agent",
        company: "Roof U.S. (Corey)",
        stage: "demo-pending-approval",
        value: 500,
        nextAction: "Follow up on team approval",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: "PROBYLT-001",
        name: "Liv Recovery AEO + Equity",
        company: "Probylt/Liv Recovery (Jeff)",
        stage: "negotiation",
        value: 10000,
        nextAction: "Clarify equity terms and commit timeline",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: "GHL-TRIAL",
        name: "GoHighLevel Trial Client",
        company: "TBD",
        stage: "prospecting",
        value: 3000,
        nextAction: "Identify and pitch 1 GHL client before trial expires",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  async askCommand(userMessage: string): Promise<string> {
    const businessContext = this.businessLines
      .sort((a, b) => a.priority - b.priority)
      .map((b) => `${b.name}: ${b.status} - Next: ${b.nextStep}`)
      .join("\n");

    const dealsContext = this.deals
      .map((d) => `${d.name} (${d.company}): ${d.stage} - Next: ${d.nextAction}`)
      .join("\n");

    const fullContext = `Business Lines:
${businessContext}

Active Deals:
${dealsContext}

Cody's request: ${userMessage}`;

    const response = await this.client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 512,
      system: this.systemPrompt,
      messages: [
        {
          role: "user",
          content: fullContext,
        },
      ],
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  }

  /**
   * Update deal status
   */
  updateDealStatus(dealId: string, newStage: string, nextAction: string) {
    const deal = this.deals.find((d) => d.id === dealId);
    if (deal) {
      deal.stage = newStage;
      deal.nextAction = nextAction;
      console.log(`✓ Deal updated: ${deal.name} → ${newStage}`);
    }
  }

  /**
   * Get status summary (Cody's overview)
   */
  getStatusSummary(): string {
    const prioritized = this.businessLines.sort((a, b) => a.priority - b.priority);

    const urgentDeals = this.deals.filter((d) => {
      if (!d.deadline) return false;
      const daysLeft = Math.floor(
        (d.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      return daysLeft < 7;
    });

    let summary = "=== COMMAND STATUS ===\n\nBusiness Lines (Priority):\n";
    summary += prioritized.map((b) => `${b.priority}. ${b.name}: ${b.nextStep}`).join("\n");

    if (urgentDeals.length > 0) {
      summary += "\n\nURGENT (< 7 days):\n";
      summary += urgentDeals
        .map(
          (d) =>
            `⚠ ${d.name}: ${d.nextAction} (Deadline: ${d.deadline?.toLocaleDateString()})`
        )
        .join("\n");
    }

    return summary;
  }

  /**
   * Get next single action (for ADHD-friendly guidance)
   */
  getNextAction(): string {
    const urgent = this.deals.find((d) => {
      if (!d.deadline) return false;
      const daysLeft = Math.floor(
        (d.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      return daysLeft < 3;
    });

    if (urgent) {
      return `NEXT: ${urgent.nextAction} on ${urgent.name} (${urgent.company})`;
    }

    const topBusiness = this.businessLines.sort((a, b) => a.priority - b.priority)[0];
    return `NEXT: ${topBusiness.nextStep} (${topBusiness.name})`;
  }
}

// Export for use
export default CommandAgent;

