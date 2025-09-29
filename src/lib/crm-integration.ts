import { prisma } from './prisma';
import logger from './logger';

// HubSpot Client type definition (avoiding import for now)
interface Client {
  accessToken: string;
  crm?: any; // Mock CRM property
}

// Initialize HubSpot client (placeholder implementation)
let hubspotClient: Client | null = null;
if (process.env.HUBSPOT_API_KEY) {
  hubspotClient = { 
    accessToken: process.env.HUBSPOT_API_KEY,
    crm: {
      contacts: {
        basicApi: {
          create: async () => ({ id: 'mock-id' }),
          update: async () => ({ id: 'mock-id' })
        }
      }
    }
  };
}

export interface CRMContactData {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  metadata?: any;
}

export interface CRMDealData {
  title: string;
  value?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: Date;
  notes?: string;
  contactId: string;
}

export interface CRMActivityData {
  type: string;
  subject?: string;
  description?: string;
  dueDate?: Date;
  status?: string;
  priority?: string;
  contactId?: string;
  dealId?: string;
}

export class CRMIntegrationService {
  // Create a new contact
  static async createContact(data: CRMContactData, organizationId: string, userId: string) {
    try {
      const contact = await prisma.cRMContact.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          position: data.position,
          source: data.source || 'website',
          status: data.status || 'lead',
          tags: data.tags ? JSON.stringify(data.tags) : null,
          notes: data.notes,
          metadata: data.metadata,
          organizationId,
          userId,
        },
      });

      // Sync to HubSpot if configured
      if (hubspotClient) {
        await this.syncContactToHubSpot(contact);
      }

      logger.info('CRM contact created', { contactId: contact.id });
      return contact;
    } catch (error) {
      logger.error('Failed to create CRM contact', { error });
      throw error;
    }
  }

  // Create a new deal
  static async createDeal(data: CRMDealData, organizationId: string, userId: string) {
    try {
      const deal = await prisma.cRMDeal.create({
        data: {
          title: data.title,
          value: data.value,
          currency: data.currency || 'USD',
          stage: data.stage || 'prospecting',
          probability: data.probability || 0,
          expectedCloseDate: data.expectedCloseDate,
          notes: data.notes,
          contactId: data.contactId,
          organizationId,
          userId,
        },
        include: {
          contact: true,
        },
      });

      // Sync to HubSpot if configured
      if (hubspotClient) {
        await this.syncDealToHubSpot(deal);
      }

      logger.info('CRM deal created', { dealId: deal.id });
      return deal;
    } catch (error) {
      logger.error('Failed to create CRM deal', { error });
      throw error;
    }
  }

  // Create a new activity
  static async createActivity(data: CRMActivityData, organizationId: string, userId: string) {
    try {
      const activity = await prisma.cRMActivity.create({
        data: {
          type: data.type,
          subject: data.subject,
          description: data.description,
          dueDate: data.dueDate,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
          contactId: data.contactId,
          dealId: data.dealId,
          organizationId,
          userId,
        },
      });

      logger.info('CRM activity created', { activityId: activity.id });
      return activity;
    } catch (error) {
      logger.error('Failed to create CRM activity', { error });
      throw error;
    }
  }

  // Get all contacts for an organization
  static async getContacts(organizationId: string) {
    try {
      const contacts = await prisma.cRMContact.findMany({
        where: { organizationId },
        include: {
          deals: true,
          activities: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return contacts;
    } catch (error) {
      logger.error('Failed to get CRM contacts', { error });
      throw error;
    }
  }

  // Get all deals for an organization
  static async getDeals(organizationId: string) {
    try {
      const deals = await prisma.cRMDeal.findMany({
        where: { organizationId },
        include: {
          contact: true,
          activities: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return deals;
    } catch (error) {
      logger.error('Failed to get CRM deals', { error });
      throw error;
    }
  }

  // Get all activities for an organization
  static async getActivities(organizationId: string) {
    try {
      const activities = await prisma.cRMActivity.findMany({
        where: { organizationId },
        include: {
          contact: true,
          deal: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return activities;
    } catch (error) {
      logger.error('Failed to get CRM activities', { error });
      throw error;
    }
  }

  // Update contact
  static async updateContact(contactId: string, data: Partial<CRMContactData>) {
    try {
      const contact = await prisma.cRMContact.update({
        where: { id: contactId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          position: data.position,
          source: data.source,
          status: data.status,
          tags: data.tags ? JSON.stringify(data.tags) : undefined,
          notes: data.notes,
          metadata: data.metadata,
        },
      });

      // Sync to HubSpot if configured
      if (hubspotClient) {
        await this.syncContactToHubSpot(contact);
      }

      logger.info('CRM contact updated', { contactId });
      return contact;
    } catch (error) {
      logger.error('Failed to update CRM contact', { error });
      throw error;
    }
  }

  // Update deal
  static async updateDeal(dealId: string, data: Partial<CRMDealData>) {
    try {
      const deal = await prisma.cRMDeal.update({
        where: { id: dealId },
        data: {
          title: data.title,
          value: data.value,
          currency: data.currency,
          stage: data.stage,
          probability: data.probability,
          expectedCloseDate: data.expectedCloseDate,
          notes: data.notes,
        },
        include: {
          contact: true,
        },
      });

      // Sync to HubSpot if configured
      if (hubspotClient) {
        await this.syncDealToHubSpot(deal);
      }

      logger.info('CRM deal updated', { dealId });
      return deal;
    } catch (error) {
      logger.error('Failed to update CRM deal', { error });
      throw error;
    }
  }

  // Close deal
  static async closeDeal(dealId: string, won: boolean = true) {
    try {
      const deal = await prisma.cRMDeal.update({
        where: { id: dealId },
        data: {
          stage: won ? 'closed_won' : 'closed_lost',
          closedAt: new Date(),
        },
      });

      logger.info('CRM deal closed', { dealId, won });
      return deal;
    } catch (error) {
      logger.error('Failed to close CRM deal', { error });
      throw error;
    }
  }

  // Sync contact to HubSpot
  private static async syncContactToHubSpot(contact: any) {
    try {
      if (!hubspotClient) return;

      const properties = {
        firstname: contact.firstName,
        lastname: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        jobtitle: contact.position,
        hs_lead_status: contact.status,
        notes: contact.notes,
      };

      await hubspotClient.crm.contacts.basicApi.create({ properties });

      logger.info('Contact synced to HubSpot', { contactId: contact.id });
    } catch (error) {
      logger.error('Failed to sync contact to HubSpot', { error });
    }
  }

  // Sync deal to HubSpot
  private static async syncDealToHubSpot(deal: any) {
    try {
      if (!hubspotClient) return;

      const properties = {
        dealname: deal.title,
        amount: deal.value?.toString(),
        dealstage: this.mapStageToHubSpot(deal.stage),
        closedate: deal.expectedCloseDate?.toISOString(),
        notes: deal.notes,
      };

      await hubspotClient.crm.deals.basicApi.create({ properties });

      logger.info('Deal synced to HubSpot', { dealId: deal.id });
    } catch (error) {
      logger.error('Failed to sync deal to HubSpot', { error });
    }
  }

  // Map internal stage to HubSpot stage
  private static mapStageToHubSpot(stage: string): string {
    const stageMap: { [key: string]: string } = {
      'prospecting': 'appointmentscheduled',
      'qualification': 'qualifiedtobuy',
      'proposal': 'presentationscheduled',
      'negotiation': 'contractsent',
      'closed_won': 'closedwon',
      'closed_lost': 'closedlost',
    };

    return stageMap[stage] || 'appointmentscheduled';
  }

  // Get CRM analytics
  static async getCRMAnalytics(organizationId: string) {
    try {
      const contacts = await prisma.cRMContact.findMany({
        where: { organizationId },
      });

      const deals = await prisma.cRMDeal.findMany({
        where: { organizationId },
      });

      const activities = await prisma.cRMActivity.findMany({
        where: { organizationId },
      });

      // Calculate metrics
      const totalContacts = contacts.length;
      const totalDeals = deals.length;
      const totalValue = deals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
      const wonDeals = deals.filter((deal: any) => deal.stage === 'closed_won');
      const wonValue = wonDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
      const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;

      // Pipeline stages
      const pipelineStages = {
        prospecting: deals.filter((d: any) => d.stage === 'prospecting').length,
        qualification: deals.filter((d: any) => d.stage === 'qualification').length,
        proposal: deals.filter((d: any) => d.stage === 'proposal').length,
        negotiation: deals.filter((d: any) => d.stage === 'negotiation').length,
        closed_won: wonDeals.length,
        closed_lost: deals.filter((d: any) => d.stage === 'closed_lost').length,
      };

      return {
        totalContacts,
        totalDeals,
        totalValue,
        wonValue,
        conversionRate,
        pipelineStages,
        recentActivities: activities.slice(0, 10),
      };
    } catch (error) {
      logger.error('Failed to get CRM analytics', { error });
      throw error;
    }
  }
} 