import { prisma } from './prisma';
import logger from './logger';

// Mock SendGrid implementation
const sgMail = {
  setApiKey: (key: string) => {},
  send: async (msg: any) => ({ statusCode: 200 })
};

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Mock Mailchimp implementation
class MockMailchimp {
  constructor(apiKey: string) {}
}

// Initialize Mailchimp
let mailchimpClient: any = null;
if (process.env.MAILCHIMP_API_KEY) {
  mailchimpClient = new MockMailchimp(process.env.MAILCHIMP_API_KEY);
}

export interface EmailCampaignData {
  name: string;
  subject: string;
  content: string;
  template?: string;
  scheduledAt?: Date;
  organizationId: string;
  userId: string;
}

export interface EmailRecipientData {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  metadata?: any;
}

export interface EmailMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export class EmailMarketingService {
  // Create a new email campaign
  static async createCampaign(data: EmailCampaignData) {
    try {
      const campaign = await prisma.emailCampaign.create({
        data: {
          name: data.name,
          subject: data.subject,
          content: data.content,
          template: data.template,
          scheduledAt: data.scheduledAt,
          status: data.scheduledAt ? 'scheduled' : 'draft',
          organizationId: data.organizationId,
          userId: data.userId,
        },
      });

      logger.info('Email campaign created', { campaignId: campaign.id });
      return campaign;
    } catch (error) {
      logger.error('Failed to create email campaign', { error });
      throw error;
    }
  }

  // Add recipients to a campaign
  static async addRecipients(campaignId: string, recipients: EmailRecipientData[]) {
    try {
      const recipientData = recipients.map(recipient => ({
        email: recipient.email,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        tags: recipient.tags ? JSON.stringify(recipient.tags) : null,
        metadata: recipient.metadata,
        campaignId,
      }));

      const createdRecipients = await prisma.emailRecipient.createMany({
        data: recipientData,
      });

      logger.info('Recipients added to campaign', { 
        campaignId, 
        count: createdRecipients.count 
      });
      return createdRecipients;
    } catch (error) {
      logger.error('Failed to add recipients', { error });
      throw error;
    }
  }

  // Send campaign via SendGrid
  static async sendViaSendGrid(campaignId: string) {
    try {
      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: { recipients: true },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const emails = campaign.recipients.map((recipient: any) => ({
        to: recipient.email,
        from: process.env.SMTP_USER || 'noreply@revsnap.com',
        subject: campaign.subject,
        html: campaign.content,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
        customArgs: {
          campaignId,
          recipientId: recipient.id,
        },
      }));

      const response = await sgMail.send(emails);

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { 
          status: 'sent',
          sentAt: new Date(),
        },
      });

      // Create email events
      const events = campaign.recipients.map((recipient: any) => ({
        type: 'sent',
        recipientId: recipient.id,
        metadata: { sendGridResponse: response },
      }));

      await prisma.emailEvent.createMany({ data: events });

      logger.info('Campaign sent via SendGrid', { 
        campaignId, 
        sentCount: emails.length 
      });
      return response;
    } catch (error) {
      logger.error('Failed to send campaign via SendGrid', { error });
      throw error;
    }
  }

  // Send campaign via Mailchimp
  static async sendViaMailchimp(campaignId: string) {
    try {
      if (!mailchimpClient) {
        throw new Error('Mailchimp not configured');
      }

      const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: { recipients: true },
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Create Mailchimp campaign
      const mailchimpCampaign = await mailchimpClient.post('/campaigns', {
        type: 'regular',
        recipients: {
          list_id: process.env.MAILCHIMP_LIST_ID,
        },
        settings: {
          subject_line: campaign.subject,
          from_name: 'RevSnap',
          reply_to: process.env.SMTP_USER || 'noreply@revsnap.com',
        },
      });

      // Set campaign content
      await mailchimpClient.put(`/campaigns/${mailchimpCampaign.id}/content`, {
        html: campaign.content,
      });

      // Send campaign
      await mailchimpClient.post(`/campaigns/${mailchimpCampaign.id}/actions/send`);

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { 
          status: 'sent',
          sentAt: new Date(),
        },
      });

      logger.info('Campaign sent via Mailchimp', { 
        campaignId, 
        mailchimpCampaignId: mailchimpCampaign.id 
      });
      return mailchimpCampaign;
    } catch (error) {
      logger.error('Failed to send campaign via Mailchimp', { error });
      throw error;
    }
  }

  // Track email events (opened, clicked, etc.)
  static async trackEmailEvent(recipientId: string, eventType: string, metadata?: any) {
    try {
      const event = await prisma.emailEvent.create({
        data: {
          type: eventType,
          recipientId,
          metadata,
        },
      });

      logger.info('Email event tracked', { 
        recipientId, 
        eventType, 
        eventId: event.id 
      });
      return event;
    } catch (error) {
      logger.error('Failed to track email event', { error });
      throw error;
    }
  }

  // Get campaign metrics
  static async getCampaignMetrics(campaignId: string): Promise<EmailMetrics> {
    try {
      const metrics = await prisma.emailMetrics.findFirst({
        where: { campaignId },
      });

      if (metrics) {
        return {
          sent: metrics.sent,
          delivered: metrics.delivered,
          opened: metrics.opened,
          clicked: metrics.clicked,
          bounced: metrics.bounced,
          unsubscribed: metrics.unsubscribed,
        };
      }

      // Calculate metrics from events if not stored
      const events = await prisma.emailEvent.findMany({
        where: {
          recipient: { campaignId },
        },
      });

      const metricsData = {
        sent: events.filter((e: any) => e.type === 'sent').length,
        delivered: events.filter((e: any) => e.type === 'delivered').length,
        opened: events.filter((e: any) => e.type === 'opened').length,
        clicked: events.filter((e: any) => e.type === 'clicked').length,
        bounced: events.filter((e: any) => e.type === 'bounced').length,
        unsubscribed: events.filter((e: any) => e.type === 'unsubscribed').length,
      };

      // Store calculated metrics
      await prisma.emailMetrics.create({
        data: {
          campaignId,
          ...metricsData,
        },
      });

      return metricsData;
    } catch (error) {
      logger.error('Failed to get campaign metrics', { error });
      throw error;
    }
  }

  // Get all campaigns for an organization
  static async getCampaigns(organizationId: string) {
    try {
      const campaigns = await prisma.emailCampaign.findMany({
        where: { organizationId },
        include: {
          recipients: true,
          metrics: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return campaigns;
    } catch (error) {
      logger.error('Failed to get campaigns', { error });
      throw error;
    }
  }

  // Unsubscribe recipient
  static async unsubscribeRecipient(recipientId: string) {
    try {
      await prisma.emailRecipient.update({
        where: { id: recipientId },
        data: { status: 'unsubscribed' },
      });

      await this.trackEmailEvent(recipientId, 'unsubscribed');

      logger.info('Recipient unsubscribed', { recipientId });
    } catch (error) {
      logger.error('Failed to unsubscribe recipient', { error });
      throw error;
    }
  }
} 