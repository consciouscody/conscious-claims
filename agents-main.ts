/**
 * MAIN AGENT ORCHESTRATOR
 * Runs all 5 agents: SEO, Blueprint, Warden, Command, Relay
 * Deploys to Buzz automatically
 */

import BuzzConnector from "./buzz-connector";

// Import agents
import SEOAgent from "./seo-agent";
import BlueprintAgent from "./blueprint-agent";
import WardenAgent from "./warden-agent";
import CommandAgent from "./command-agent";
import RelayAgent from "./relay-agent";

class AgentOrchestrator {
  private agents: any[] = [];
  private buzzConnectors: Map<string, BuzzConnector> = new Map();

  async start() {
    console.log("🚀 Starting Agent Orchestrator...\n");

    // Initialize SEO Agent
    console.log("📊 Starting SEO Agent...");
    const seoAgent = new SEOAgent();
    this.buzzConnectors.set("seo", new BuzzConnector("SEO Agent", "seo-reports"));
    await this.buzzConnectors.get("seo")!.connect();
    this.buzzConnectors
      .get("seo")!
      .postToChannel("🤖 SEO Agent online. Ready to audit websites.");
    this.agents.push(seoAgent);

    // Initialize Blueprint Agent
    console.log("🎓 Starting Blueprint Agent...");
    const blueprintAgent = new BlueprintAgent();
    this.buzzConnectors.set("blueprint", new BuzzConnector("Blueprint", "skool"));
    await this.buzzConnectors.get("blueprint")!.connect();
    this.buzzConnectors
      .get("blueprint")!
      .postToChannel("🎓 Blueprint Agent online. Ready to build curriculum.");
    this.agents.push(blueprintAgent);

    // Initialize Warden Agent
    console.log("⚙️ Starting Warden Agent...");
    const wardenAgent = new WardenAgent();
    this.buzzConnectors.set("warden", new BuzzConnector("Warden", "field-ops"));
    await this.buzzConnectors.get("warden")!.connect();
    this.buzzConnectors
      .get("warden")!
      .postToChannel("⚙️ Warden Agent online. Ready for field ops and LOTO logging.");
    this.agents.push(wardenAgent);

    // Initialize Command Agent
    console.log("💼 Starting Command Agent...");
    const commandAgent = new CommandAgent();
    this.buzzConnectors.set("command", new BuzzConnector("Command", "command-center"));
    await this.buzzConnectors.get("command")!.connect();
    this.buzzConnectors
      .get("command")!
      .postToChannel("💼 Command Agent online. " + commandAgent.getNextAction());
    this.agents.push(commandAgent);

    // Initialize Relay Agent
    console.log("🔄 Starting Relay Agent...");
    const relayAgent = new RelayAgent();
    this.buzzConnectors.set("relay", new BuzzConnector("Relay", "relay-logs"));
    await this.buzzConnectors.get("relay")!.connect();
    this.buzzConnectors
      .get("relay")!
      .postToChannel("🔄 Relay Agent online. Coordinating all agents.");
    this.agents.push(relayAgent);

    console.log("\n✅ ALL AGENTS ONLINE IN BUZZ\n");
    console.log("Channels:");
    console.log("  #seo-reports → SEO Agent");
    console.log("  #skool → Blueprint Agent");
    console.log("  #field-ops → Warden Agent");
    console.log("  #command-center → Command Agent");
    console.log("  #relay-logs → Relay Agent\n");

    // Keep agents running
    setInterval(() => {
      console.log("✓ All agents running...");
    }, 60000);
  }

  stop() {
    console.log("\n🛑 Shutting down agents...");
    this.buzzConnectors.forEach((connector) => connector.disconnect());
    process.exit(0);
  }
}

// Start orchestrator
const orchestrator = new AgentOrchestrator();
orchestrator.start().catch((err) => {
  console.error("Fatal error:", err);
  orchestrator.stop();
});

// Handle graceful shutdown
process.on("SIGINT", () => orchestrator.stop());
process.on("SIGTERM", () => orchestrator.stop());
