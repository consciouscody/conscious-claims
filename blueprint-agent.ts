/**
 * BLUEPRINT Agent - Course Builder for Data Center Energy Control Training
 * Serves: Cody and John McCain
 * Lives: Skool (private community, admin-facing)
 * Purpose: Build, organize, complete training curriculum to GNPEC + WIOA spec
 */

import Anthropic from "@anthropic-ai/sdk";

interface Module {
  id: number;
  name: string;
  status: "draft" | "in-progress" | "complete" | "submitted";
  lessons: Lesson[];
  clockHours: number;
  assessmentMethod: string;
  instructorQualifications: string;
}

interface Lesson {
  title: string;
  objectives: string[];
  content: string;
  clockHours: number;
}

class BlueprintAgent {
  private client: Anthropic;
  private modules: Module[] = [];
  private systemPrompt = `You are Blueprint, the course architecture agent for the Data Center Energy Control training program built by John and Cody McCain under the Atlas brand.

Your one job is to help Cody and John build, organize, and complete the training curriculum so it meets GNPEC state licensing requirements and WIOA ETPL eligibility standards.

Program: Data Center Energy Control Specialist (note: cannot use the word "Certified" per GNPEC naming rules — flag this if it appears).

The curriculum has 10 modules:
1. Introduction to Data Center Infrastructure
2. Electrical Fundamentals for Data Centers
3. Lockout/Tagout (LOTO) Procedures and Compliance
4. Energization Sequencing and Protocols
5. Critical Systems: UPS, PDU, ATS, Switchgear
6. Hot/Cold Aisle Containment and Cooling Systems
7. DCIM and Monitoring Systems
8. Safety Compliance: OSHA, NFPA 70E, NEC
9. Commissioning Procedures and Documentation
10. Career Pathways and Industry Certification

GNPEC requires for each module:
- Detailed lesson plan with learning objectives
- Clock hours documented
- Assessment method defined
- Instructor qualifications tied to content

WIOA requires:
- Industry-recognized credential pathway
- Employment outcome data tied to program
- Performance reporting capability built in

How you respond:
- When asked what to build next, give ONE specific task. Not a list. One task with exactly what needs to be produced.
- When raw content is uploaded (voice memos, field notes, transcripts), extract it into structured lesson content formatted for Skool modules.
- When asked if something meets GNPEC or WIOA standards, check against criteria and give direct yes/no with specific gap if no.
- Tone: Direct. No filler. You are a co-builder, not a tutor.
- Do not give motivational speeches, summarize things they already know, or ask more than one question at a time.`;

  constructor() {
    this.client = new Anthropic();
    this.initializeModules();
  }

  private initializeModules() {
    const moduleNames = [
      "Introduction to Data Center Infrastructure",
      "Electrical Fundamentals for Data Centers",
      "Lockout/Tagout (LOTO) Procedures and Compliance",
      "Energization Sequencing and Protocols",
      "Critical Systems: UPS, PDU, ATS, Switchgear",
      "Hot/Cold Aisle Containment and Cooling Systems",
      "DCIM and Monitoring Systems",
      "Safety Compliance: OSHA, NFPA 70E, NEC",
      "Commissioning Procedures and Documentation",
      "Career Pathways and Industry Certification",
    ];

    this.modules = moduleNames.map((name, idx) => ({
      id: idx + 1,
      name,
      status: "draft",
      lessons: [],
      clockHours: 0,
      assessmentMethod: "",
      instructorQualifications: "",
    }));
  }

  async askBlueprint(userMessage: string): Promise<string> {
    const moduleSummary = this.modules
      .map(
        (m) =>
          `Module ${m.id}: ${m.name} (${m.status}) - ${m.clockHours} hours`
      )
      .join("\n");

    const contextMessage = `Current curriculum status:
${moduleSummary}

User request: ${userMessage}`;

    const response = await this.client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1024,
      system: this.systemPrompt,
      messages: [
        {
          role: "user",
          content: contextMessage,
        },
      ],
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  }

  async processRawContent(
    moduleId: number,
    rawContent: string
  ): Promise<Lesson> {
    const prompt = `Extract structured lesson content from this raw material for Module ${moduleId}.

Raw content:
${rawContent}

Return a JSON object with: title, objectives (array), content (structured), and estimated clock hours.`;

    const response = await this.client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(responseText);
      return {
        title: parsed.title,
        objectives: parsed.objectives,
        content: parsed.content,
        clockHours: parsed.clockHours,
      };
    } catch {
      return {
        title: "Extracted Content",
        objectives: ["Parse raw content into structured format"],
        content: responseText,
        clockHours: 0,
      };
    }
  }

  async validateGNPEC(moduleId: number): Promise<string> {
    const module = this.modules.find((m) => m.id === moduleId);
    if (!module) return "Module not found";

    const validation = `GNPEC Validation Check for Module ${moduleId}:
- Lesson plan complete: ${module.lessons.length > 0 ? "yes" : "no"}
- Clock hours documented: ${module.clockHours > 0 ? "yes" : "no"}
- Assessment method defined: ${module.assessmentMethod ? "yes" : "no"}
- Instructor qualifications specified: ${module.instructorQualifications ? "yes" : "no"}

Status: ${
      module.lessons.length > 0 &&
      module.clockHours > 0 &&
      module.assessmentMethod &&
      module.instructorQualifications
        ? "GNPEC READY"
        : "INCOMPLETE - Fix above gaps"
    }`;

    return validation;
  }

  getStatus(): string {
    return `Blueprint Status:
${this.modules.map((m) => `${m.id}. ${m.name}: ${m.status}`).join("\n")}`;
  }
}

// Export for use
export default BlueprintAgent;

// Run if direct invocation
if (require.main === module) {
  const blueprint = new BlueprintAgent();
  console.log(blueprint.getStatus());
}
