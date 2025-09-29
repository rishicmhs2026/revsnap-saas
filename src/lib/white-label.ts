// White-label customization features for Enterprise plans
import { PlanService } from './plan-limits'

export interface WhiteLabelConfig {
  id: string
  organizationId: string
  isActive: boolean
  branding: {
    companyName: string
    logo: {
      primary: string // URL or base64
      secondary?: string
      favicon?: string
    }
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
      border: string
    }
    fonts: {
      primary: string
      secondary?: string
    }
  }
  customization: {
    hideRevSnapBranding: boolean
    customFooter?: string
    customCss?: string
    customDomain?: string
    customEmailTemplates: boolean
    customReportTemplates: boolean
  }
  features: {
    customDashboardLayout: boolean
    customMenuItems: Array<{
      label: string
      url: string
      icon?: string
      position: number
    }>
    customWidgets: Array<{
      id: string
      name: string
      type: string
      config: Record<string, any>
    }>
  }
  seo: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CustomEmailTemplate {
  id: string
  organizationId: string
  type: 'welcome' | 'invitation' | 'alert' | 'report' | 'notification'
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: Array<{
    name: string
    description: string
    required: boolean
  }>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CustomReportTemplate {
  id: string
  organizationId: string
  name: string
  description: string
  type: 'dashboard' | 'analytics' | 'competitor' | 'pricing'
  layout: {
    sections: Array<{
      id: string
      title: string
      type: 'chart' | 'table' | 'metric' | 'text'
      config: Record<string, any>
      position: { x: number; y: number; width: number; height: number }
    }>
  }
  styling: {
    colors: string[]
    fonts: string[]
    theme: 'light' | 'dark' | 'custom'
  }
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Default white-label themes
export const WHITE_LABEL_THEMES = {
  corporate: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1e293b',
      border: '#e2e8f0'
    },
    fonts: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Georgia, serif'
    }
  },
  finance: {
    colors: {
      primary: '#1e40af',
      secondary: '#475569',
      accent: '#059669',
      background: '#f8fafc',
      text: '#0f172a',
      border: '#cbd5e1'
    },
    fonts: {
      primary: 'Roboto, system-ui, sans-serif',
      secondary: 'Playfair Display, serif'
    }
  },
  tech: {
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#111827',
      text: '#f9fafb',
      border: '#374151'
    },
    fonts: {
      primary: 'JetBrains Mono, monospace',
      secondary: 'Inter, sans-serif'
    }
  },
  retail: {
    colors: {
      primary: '#dc2626',
      secondary: '#78716c',
      accent: '#ea580c',
      background: '#fffbeb',
      text: '#292524',
      border: '#d6d3d1'
    },
    fonts: {
      primary: 'Poppins, system-ui, sans-serif',
      secondary: 'Merriweather, serif'
    }
  }
}

export class WhiteLabelService {
  /**
   * Check if white-label features are available
   */
  static isAvailable(planId: string): boolean {
    return PlanService.hasFeature(planId, 'whiteLabel')
  }

  /**
   * Get white-label capabilities based on plan
   */
  static getCapabilities(planId: string): {
    customBranding: boolean
    customDomain: boolean
    hideRevSnapBranding: boolean
    customEmailTemplates: boolean
    customReportTemplates: boolean
    customCSS: boolean
    customDashboard: boolean
    unlimitedCustomization: boolean
  } {
    switch (planId) {
      case 'enterprise':
        return {
          customBranding: true,
          customDomain: true,
          hideRevSnapBranding: true,
          customEmailTemplates: true,
          customReportTemplates: true,
          customCSS: true,
          customDashboard: true,
          unlimitedCustomization: true
        }
      default:
        return {
          customBranding: false,
          customDomain: false,
          hideRevSnapBranding: false,
          customEmailTemplates: false,
          customReportTemplates: false,
          customCSS: false,
          customDashboard: false,
          unlimitedCustomization: false
        }
    }
  }

  /**
   * Create or update white-label configuration
   */
  static async updateConfig(
    organizationId: string,
    config: Partial<WhiteLabelConfig>,
    planId: string
  ): Promise<{ success: boolean; config?: WhiteLabelConfig; error?: string }> {
    try {
      // Check if white-label is available
      if (!this.isAvailable(planId)) {
        return { success: false, error: 'White-label features not available in your plan' }
      }

      const capabilities = this.getCapabilities(planId)

      // Get existing config or create new one
      let existingConfig = await this.getConfig(organizationId)
      
      if (!existingConfig) {
        existingConfig = this.createDefaultConfig(organizationId)
      }

      // Validate and apply updates based on plan capabilities
      const updatedConfig: WhiteLabelConfig = {
        ...existingConfig,
        ...config,
        branding: {
          ...existingConfig.branding,
          ...config.branding
        },
        customization: {
          ...existingConfig.customization,
          ...config.customization,
          // Enforce plan restrictions
          hideRevSnapBranding: capabilities.hideRevSnapBranding ? 
            (config.customization?.hideRevSnapBranding ?? existingConfig.customization.hideRevSnapBranding) : 
            false,
          customDomain: capabilities.customDomain ? 
            (config.customization?.customDomain ?? existingConfig.customization.customDomain) : 
            undefined,
          customEmailTemplates: capabilities.customEmailTemplates ? 
            (config.customization?.customEmailTemplates ?? existingConfig.customization.customEmailTemplates) : 
            false,
          customReportTemplates: capabilities.customReportTemplates ? 
            (config.customization?.customReportTemplates ?? existingConfig.customization.customReportTemplates) : 
            false
        },
        updatedAt: new Date()
      }

      // Store configuration
      await this.storeConfig(updatedConfig)

      // Apply branding changes
      await this.applyBrandingChanges(updatedConfig)

      return { success: true, config: updatedConfig }

    } catch (error) {
      console.error('Error updating white-label config:', error)
      return { success: false, error: 'Failed to update configuration' }
    }
  }

  /**
   * Create custom email template
   */
  static async createEmailTemplate(
    organizationId: string,
    template: Omit<CustomEmailTemplate, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>,
    planId: string
  ): Promise<{ success: boolean; template?: CustomEmailTemplate; error?: string }> {
    try {
      const capabilities = this.getCapabilities(planId)
      
      if (!capabilities.customEmailTemplates) {
        return { success: false, error: 'Custom email templates not available in your plan' }
      }

      const emailTemplate: CustomEmailTemplate = {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await this.storeEmailTemplate(emailTemplate)

      return { success: true, template: emailTemplate }

    } catch (error) {
      console.error('Error creating email template:', error)
      return { success: false, error: 'Failed to create email template' }
    }
  }

  /**
   * Create custom report template
   */
  static async createReportTemplate(
    organizationId: string,
    template: Omit<CustomReportTemplate, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>,
    planId: string
  ): Promise<{ success: boolean; template?: CustomReportTemplate; error?: string }> {
    try {
      const capabilities = this.getCapabilities(planId)
      
      if (!capabilities.customReportTemplates) {
        return { success: false, error: 'Custom report templates not available in your plan' }
      }

      const reportTemplate: CustomReportTemplate = {
        id: `report_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await this.storeReportTemplate(reportTemplate)

      return { success: true, template: reportTemplate }

    } catch (error) {
      console.error('Error creating report template:', error)
      return { success: false, error: 'Failed to create report template' }
    }
  }

  /**
   * Apply theme preset
   */
  static async applyTheme(
    organizationId: string,
    themeName: keyof typeof WHITE_LABEL_THEMES,
    planId: string
  ): Promise<{ success: boolean; config?: WhiteLabelConfig; error?: string }> {
    const theme = WHITE_LABEL_THEMES[themeName]
    if (!theme) {
      return { success: false, error: 'Invalid theme name' }
    }

    return this.updateConfig(organizationId, {
      branding: {
        companyName: '', // Keep existing company name
        logo: { primary: '' }, // Keep existing logo
        colors: theme.colors,
        fonts: theme.fonts
      }
    }, planId)
  }

  /**
   * Generate custom CSS based on configuration
   */
  static generateCustomCSS(config: WhiteLabelConfig): string {
    const { colors, fonts } = config.branding

    return `
      :root {
        --primary-color: ${colors.primary};
        --secondary-color: ${colors.secondary};
        --accent-color: ${colors.accent};
        --background-color: ${colors.background};
        --text-color: ${colors.text};
        --border-color: ${colors.border};
        --primary-font: ${fonts.primary};
        --secondary-font: ${fonts.secondary || fonts.primary};
      }

      /* Custom styling */
      .custom-branded {
        font-family: var(--primary-font);
        color: var(--text-color);
        background-color: var(--background-color);
      }

      .custom-branded .btn-primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }

      .custom-branded .btn-secondary {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
      }

      .custom-branded .text-accent {
        color: var(--accent-color);
      }

      .custom-branded .border-custom {
        border-color: var(--border-color);
      }

      ${config.customization.customCss || ''}
    `
  }

  /**
   * Get white-label configuration for organization
   */
  static async getConfig(organizationId: string): Promise<WhiteLabelConfig | null> {
    // Mock implementation - in real app, query database
    return null
  }

  /**
   * Get email templates for organization
   */
  static async getEmailTemplates(organizationId: string): Promise<CustomEmailTemplate[]> {
    // Mock implementation
    return []
  }

  /**
   * Get report templates for organization
   */
  static async getReportTemplates(organizationId: string): Promise<CustomReportTemplate[]> {
    // Mock implementation
    return []
  }

  /**
   * Validate custom domain
   */
  static async validateCustomDomain(domain: string): Promise<{
    valid: boolean
    errors: string[]
    suggestions?: string[]
  }> {
    const errors: string[] = []
    const suggestions: string[] = []

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/
    
    if (!domainRegex.test(domain)) {
      errors.push('Invalid domain format')
    }

    // Check if domain is available (mock)
    if (domain.includes('reserved')) {
      errors.push('Domain is reserved')
      suggestions.push(domain.replace('reserved', 'custom'))
    }

    return {
      valid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }
  }

  /**
   * Create default white-label configuration
   */
  private static createDefaultConfig(organizationId: string): WhiteLabelConfig {
    return {
      id: `wl_config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      isActive: false,
      branding: {
        companyName: '',
        logo: {
          primary: ''
        },
        colors: WHITE_LABEL_THEMES.corporate.colors,
        fonts: WHITE_LABEL_THEMES.corporate.fonts
      },
      customization: {
        hideRevSnapBranding: false,
        customEmailTemplates: false,
        customReportTemplates: false
      },
      features: {
        customDashboardLayout: false,
        customMenuItems: [],
        customWidgets: []
      },
      seo: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Apply branding changes to the application
   */
  private static async applyBrandingChanges(config: WhiteLabelConfig): Promise<void> {
    // In a real implementation, this would:
    // 1. Update CSS variables
    // 2. Regenerate static assets
    // 3. Update CDN configuration
    // 4. Invalidate caches
    console.log('Applying branding changes for organization:', config.organizationId)
  }

  // Mock storage methods
  private static async storeConfig(config: WhiteLabelConfig): Promise<void> {
    console.log('Storing white-label config:', config.id)
  }

  private static async storeEmailTemplate(template: CustomEmailTemplate): Promise<void> {
    console.log('Storing email template:', template.id)
  }

  private static async storeReportTemplate(template: CustomReportTemplate): Promise<void> {
    console.log('Storing report template:', template.id)
  }
} 