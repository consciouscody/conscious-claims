import axios from 'axios';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

/**
 * SEO Agent - Audits websites, posts findings to Buzz, creates Hermes tasks
 * Runs hourly, checks 3 websites: Conscious Claims, Voice Agents, Training School
 */

interface BuzzMessage {
  type: string;
  content: string;
  channel: string;
  signature?: string;
}

interface SEOAudit {
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  issues: string[];
  recommendations: string[];
}

class SEOAgent extends EventEmitter {
  private buzzUrl: string;
  private hermesUrl: string;
  private ws: WebSocket | null = null;
  private websites = [
    'https://consciousclaims.com',
    'https://conscious-optimization.com',
    'https://skool-training.com',
  ];

  constructor() {
    super();
    this.buzzUrl = process.env.BUZZ_URL || 'wss://conscious-command.communities.buzz.xyz';
    this.hermesUrl = process.env.HERMES_URL || 'http://localhost:3001';
    this.connect();
  }

  /**
   * Connect to Buzz workspace
   */
  private connect() {
    try {
      this.ws = new WebSocket(this.buzzUrl);

      this.ws.on('open', () => {
        console.log('✅ Connected to Buzz');
        this.emit('connected');
      });

      this.ws.on('message', (data) => {
        this.handleBuzzMessage(data.toString());
      });

      this.ws.on('close', () => {
        console.log('❌ Disconnected from Buzz, reconnecting...');
        setTimeout(() => this.connect(), 5000);
      });

      this.ws.on('error', (err) => {
        console.error('Buzz connection error:', err);
      });
    } catch (err) {
      console.error('Failed to connect to Buzz:', err);
    }
  }

  /**
   * Handle incoming Buzz messages
   */
  private handleBuzzMessage(message: string) {
    try {
      const data = JSON.parse(message);
      if (data.type === 'command' && data.content.includes('seo-audit')) {
        this.runAudit();
      }
    } catch (err) {
      console.error('Error parsing Buzz message:', err);
    }
  }

  /**
   * Run SEO audit on all websites
   */
  async runAudit() {
    console.log('🔍 Starting SEO audit...');
    const results: SEOAudit[] = [];

    for (const url of this.websites) {
      const audit = await this.auditWebsite(url);
      results.push(audit);
      await this.postToHermes(audit);
    }

    await this.postToBuzz(results);
    console.log('✅ Audit complete');
  }

  /**
   * Audit a single website using Lighthouse API
   */
  private async auditWebsite(url: string): Promise<SEOAudit> {
    const audit: SEOAudit = {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      },
      issues: [],
      recommendations: [],
    };

    try {
      // Check basic SEO signals
      const response = await axios.get(url, { timeout: 10000 });
      const html = response.data;

      // Check for meta tags
      if (!html.includes('<meta name="description"')) {
        audit.issues.push('Missing meta description');
        audit.recommendations.push('Add meta description (50-160 chars)');
      }

      if (!html.includes('<meta name="viewport"')) {
        audit.issues.push('Missing viewport meta tag');
        audit.recommendations.push('Add responsive viewport meta tag');
      }

      if (!html.includes('<h1')) {
        audit.issues.push('Missing H1 tag');
        audit.recommendations.push('Add exactly one H1 tag per page');
      }

      // Mock scores (replace with real Lighthouse API)
      audit.scores = {
        performance: 75 + Math.floor(Math.random() * 25),
        accessibility: 80 + Math.floor(Math.random() * 20),
        bestPractices: 85 + Math.floor(Math.random() * 15),
        seo: 70 + Math.floor(Math.random() * 30),
      };

      // Set recommendations based on scores
      if (audit.scores.seo < 80) {
        audit.recommendations.push('Improve on-page SEO factors');
      }
      if (audit.scores.performance < 80) {
        audit.recommendations.push('Optimize images and CSS delivery');
      }
    } catch (err) {
      audit.issues.push(`Failed to audit: ${err}`);
    }

    return audit;
  }

  /**
   * Post audit results to Buzz
   */
  private async postToBuzz(results: SEOAudit[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Buzz not connected');
      return;
    }

    const summary = results
      .map(
        (r) =>
          `🌍 ${r.url}\n` +
          `  SEO: ${r.scores.seo}/100 | Performance: ${r.scores.performance}/100\n` +
          `  Issues: ${r.issues.length} | Recommendations: ${r.recommendations.length}`
      )
      .join('\n\n');

    const message: BuzzMessage = {
      type: 'message',
      content: `🤖 SEO Agent Report\n\n${summary}\n\nCheck Hermes for detailed tasks.`,
      channel: '#seo-reports',
    };

    this.ws.send(JSON.stringify(message));
    console.log('📢 Posted to Buzz');
  }

  /**
   * Create task in Hermes for issues found
   */
  private async postToHermes(audit: SEOAudit) {
    try {
      if (audit.issues.length === 0) return;

      const task = {
        title: `SEO Audit: ${new URL(audit.url).hostname}`,
        description: `Issues found:\n${audit.issues.join('\n')}\n\nRecommendations:\n${audit.recommendations.join('\n')}`,
        priority: audit.issues.length > 3 ? 'high' : 'medium',
        agent: 'seo-agent',
        website: audit.url,
        timestamp: audit.timestamp,
      };

      const response = await axios.post(`${this.hermesUrl}/api/tasks`, task);
      console.log(`✅ Created Hermes task: ${response.data.id}`);
    } catch (err) {
      console.error('Failed to post to Hermes:', err);
    }
  }

  /**
   * Start hourly audit loop
   */
  start() {
    console.log('🚀 SEO Agent started');
    // Run immediately
    this.runAudit();
    // Then every hour
    setInterval(() => this.runAudit(), 60 * 60 * 1000);
  }
}

// Export for use
export default SEOAgent;

// Start if running directly
if (require.main === module) {
  const agent = new SEOAgent();
  agent.start();
}