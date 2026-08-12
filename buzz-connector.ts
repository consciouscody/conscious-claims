/**
 * BUZZ CONNECTOR - Simple integration for all agents
 * Handles: Connect to Buzz, post messages, receive commands
 *
 * Every agent uses this. Don't overthink it.
 */

import WebSocket from "ws";

interface BuzzMessage {
  type: string;
  content: string;
  channel: string;
  timestamp: Date;
}

class BuzzConnector {
  private ws: WebSocket | null = null;
  private buzzUrl = process.env.BUZZ_URL || "wss://conscious-command.communities.buzz.xyz";
  private agentName: string;
  private agentChannel: string;

  constructor(agentName: string, channelName: string) {
    this.agentName = agentName;
    this.agentChannel = `#${channelName}`;
  }

  /**
   * Connect to Buzz (call this when agent starts)
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.buzzUrl);

        this.ws.on("open", () => {
          console.log(`✅ ${this.agentName} connected to Buzz at ${this.agentChannel}`);
          resolve();
        });

        this.ws.on("message", (data) => {
          this.handleIncomingMessage(data.toString());
        });

        this.ws.on("close", () => {
          console.log(`❌ ${this.agentName} disconnected from Buzz. Reconnecting...`);
          setTimeout(() => this.connect(), 5000);
        });

        this.ws.on("error", (err) => {
          console.error(`Error: ${this.agentName} - ${err}`);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Post a message to Buzz channel
   * Call this whenever agent wants to say something
   */
  postToChannel(message: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error(`${this.agentName}: Not connected to Buzz`);
      return;
    }

    const buzzMessage: BuzzMessage = {
      type: "message",
      content: message,
      channel: this.agentChannel,
      timestamp: new Date(),
    };

    this.ws.send(JSON.stringify(buzzMessage));
    console.log(`📤 ${this.agentName} posted to ${this.agentChannel}`);
  }

  /**
   * Handle incoming messages from Buzz
   * Override in each agent if needed
   */
  private handleIncomingMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      console.log(`📥 ${this.agentName} received in ${this.agentChannel}:`, data.content);
    } catch (err) {
      console.error(`Parse error: ${err}`);
    }
  }

  /**
   * Disconnect from Buzz
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      console.log(`${this.agentName} disconnected`);
    }
  }
}

export default BuzzConnector;
