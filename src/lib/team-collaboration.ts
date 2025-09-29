// Team collaboration features for Professional and Enterprise plans
import { PlanService } from './plan-limits'

export interface TeamMember {
  id: string
  userId: string
  organizationId: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'manager' | 'viewer'
  permissions: TeamPermission[]
  status: 'active' | 'pending' | 'suspended'
  invitedBy: string
  joinedAt?: Date
  lastActive?: Date
}

export interface TeamPermission {
  resource: 'products' | 'tracking' | 'analytics' | 'billing' | 'team' | 'api'
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
}

export interface TeamInvitation {
  id: string
  organizationId: string
  email: string
  role: TeamMember['role']
  permissions: TeamPermission[]
  invitedBy: string
  token: string
  expiresAt: Date
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  createdAt: Date
}

export interface ActivityLog {
  id: string
  organizationId: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  timestamp: Date
  ipAddress?: string
}

export interface TeamNotification {
  id: string
  organizationId: string
  userId?: string // null for all team members
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  actionUrl?: string
  read: boolean
  createdAt: Date
  expiresAt?: Date
}

// Role-based permissions matrix
const ROLE_PERMISSIONS: Record<TeamMember['role'], TeamPermission[]> = {
  owner: [
    { resource: 'products', action: 'manage' },
    { resource: 'tracking', action: 'manage' },
    { resource: 'analytics', action: 'manage' },
    { resource: 'billing', action: 'manage' },
    { resource: 'team', action: 'manage' },
    { resource: 'api', action: 'manage' }
  ],
  admin: [
    { resource: 'products', action: 'manage' },
    { resource: 'tracking', action: 'manage' },
    { resource: 'analytics', action: 'read' },
    { resource: 'team', action: 'manage' },
    { resource: 'api', action: 'create' }
  ],
  manager: [
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'update' },
    { resource: 'tracking', action: 'manage' },
    { resource: 'analytics', action: 'read' },
    { resource: 'team', action: 'read' }
  ],
  viewer: [
    { resource: 'products', action: 'read' },
    { resource: 'tracking', action: 'read' },
    { resource: 'analytics', action: 'read' }
  ]
}

export class TeamCollaborationService {
  /**
   * Check if team collaboration is available for the plan
   */
  static isAvailable(planId: string): boolean {
    return PlanService.hasFeature(planId, 'teamCollaboration')
  }

  /**
   * Get team member limits based on plan
   */
  static getTeamLimits(planId: string): {
    maxMembers: number
    canInviteExternal: boolean
    hasAdvancedPermissions: boolean
    hasActivityLogs: boolean
  } {
    switch (planId) {
      case 'professional':
        return {
          maxMembers: 5,
          canInviteExternal: true,
          hasAdvancedPermissions: false,
          hasActivityLogs: false
        }
      case 'enterprise':
        return {
          maxMembers: -1, // unlimited
          canInviteExternal: true,
          hasAdvancedPermissions: true,
          hasActivityLogs: true
        }
      default:
        return {
          maxMembers: 1, // just the owner
          canInviteExternal: false,
          hasAdvancedPermissions: false,
          hasActivityLogs: false
        }
    }
  }

  /**
   * Invite a team member
   */
  static async inviteTeamMember(
    organizationId: string,
    email: string,
    role: TeamMember['role'],
    invitedBy: string,
    planId: string,
    customPermissions?: TeamPermission[]
  ): Promise<{ success: boolean; invitation?: TeamInvitation; error?: string }> {
    try {
      // Check if team collaboration is available
      if (!this.isAvailable(planId)) {
        return { success: false, error: 'Team collaboration not available in your plan' }
      }

      // Check team limits
      const limits = this.getTeamLimits(planId)
      const currentMemberCount = await this.getTeamMemberCount(organizationId)
      
      if (limits.maxMembers !== -1 && currentMemberCount >= limits.maxMembers) {
        return { success: false, error: `Team limit reached. Maximum ${limits.maxMembers} members allowed.` }
      }

      // Check if already invited or member
      const existingMember = await this.findTeamMember(organizationId, email)
      if (existingMember) {
        return { success: false, error: 'User is already a team member' }
      }

      const existingInvitation = await this.findPendingInvitation(organizationId, email)
      if (existingInvitation) {
        return { success: false, error: 'Invitation already sent to this email' }
      }

      // Generate invitation
      const invitation: TeamInvitation = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        email,
        role,
        permissions: customPermissions || ROLE_PERMISSIONS[role],
        invitedBy,
        token: this.generateInvitationToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        createdAt: new Date()
      }

      // Store invitation (mock - in real app, save to database)
      await this.storeInvitation(invitation)

      // Send invitation email (mock)
      await this.sendInvitationEmail(invitation)

      // Log activity
      await this.logActivity(organizationId, invitedBy, 'team_invite', 'invitation', invitation.id, {
        email,
        role
      })

      return { success: true, invitation }

    } catch (error) {
      console.error('Error inviting team member:', error)
      return { success: false, error: 'Failed to send invitation' }
    }
  }

  /**
   * Accept team invitation
   */
  static async acceptInvitation(
    token: string,
    userId: string
  ): Promise<{ success: boolean; member?: TeamMember; error?: string }> {
    try {
      // Find invitation by token
      const invitation = await this.findInvitationByToken(token)
      if (!invitation) {
        return { success: false, error: 'Invalid or expired invitation' }
      }

      if (invitation.status !== 'pending') {
        return { success: false, error: 'Invitation has already been processed' }
      }

      if (invitation.expiresAt < new Date()) {
        return { success: false, error: 'Invitation has expired' }
      }

      // Create team member
      const member: TeamMember = {
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        organizationId: invitation.organizationId,
        email: invitation.email,
        name: await this.getUserName(userId),
        role: invitation.role,
        permissions: invitation.permissions,
        status: 'active',
        invitedBy: invitation.invitedBy,
        joinedAt: new Date(),
        lastActive: new Date()
      }

      // Store team member
      await this.storeTeamMember(member)

      // Update invitation status
      invitation.status = 'accepted'
      await this.updateInvitation(invitation)

      // Log activity
      await this.logActivity(invitation.organizationId, userId, 'team_join', 'member', member.id, {
        role: member.role
      })

      // Send welcome notification
      await this.createNotification(invitation.organizationId, userId, {
        type: 'success',
        title: 'Welcome to the team!',
        message: `You've successfully joined the organization as ${member.role}`,
        read: false
      })

      return { success: true, member }

    } catch (error) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: 'Failed to accept invitation' }
    }
  }

  /**
   * Update team member role and permissions
   */
  static async updateTeamMember(
    organizationId: string,
    memberId: string,
    updates: Partial<Pick<TeamMember, 'role' | 'permissions' | 'status'>>,
    updatedBy: string,
    planId: string
  ): Promise<{ success: boolean; member?: TeamMember; error?: string }> {
    try {
      const member = await this.findTeamMemberById(organizationId, memberId)
      if (!member) {
        return { success: false, error: 'Team member not found' }
      }

      // Check permissions for advanced role management
      const limits = this.getTeamLimits(planId)
      if (!limits.hasAdvancedPermissions && updates.permissions) {
        return { success: false, error: 'Advanced permissions not available in your plan' }
      }

      // Prevent removing the last owner
      if (updates.role && updates.role !== 'owner' && member.role === 'owner') {
        const ownerCount = await this.getOwnerCount(organizationId)
        if (ownerCount <= 1) {
          return { success: false, error: 'Cannot remove the last owner' }
        }
      }

      // Update member
      const updatedMember: TeamMember = {
        ...member,
        ...updates,
        permissions: updates.permissions || (updates.role ? ROLE_PERMISSIONS[updates.role] : member.permissions)
      }

      await this.updateTeamMember_DB(updatedMember)

      // Log activity
      await this.logActivity(organizationId, updatedBy, 'team_update', 'member', memberId, updates)

      return { success: true, member: updatedMember }

    } catch (error) {
      console.error('Error updating team member:', error)
      return { success: false, error: 'Failed to update team member' }
    }
  }

  /**
   * Remove team member
   */
  static async removeTeamMember(
    organizationId: string,
    memberId: string,
    removedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const member = await this.findTeamMemberById(organizationId, memberId)
      if (!member) {
        return { success: false, error: 'Team member not found' }
      }

      // Prevent removing the last owner
      if (member.role === 'owner') {
        const ownerCount = await this.getOwnerCount(organizationId)
        if (ownerCount <= 1) {
          return { success: false, error: 'Cannot remove the last owner' }
        }
      }

      await this.deleteTeamMember(organizationId, memberId)

      // Log activity
      await this.logActivity(organizationId, removedBy, 'team_remove', 'member', memberId, {
        email: member.email,
        role: member.role
      })

      return { success: true }

    } catch (error) {
      console.error('Error removing team member:', error)
      return { success: false, error: 'Failed to remove team member' }
    }
  }

  /**
   * Check if user has permission for an action
   */
  static async hasPermission(
    userId: string,
    organizationId: string,
    resource: TeamPermission['resource'],
    action: TeamPermission['action']
  ): Promise<boolean> {
    try {
      const member = await this.findTeamMemberByUserId(organizationId, userId)
      if (!member || member.status !== 'active') {
        return false
      }

      // Check if user has specific permission
      return member.permissions.some(permission => 
        permission.resource === resource && 
        (permission.action === action || permission.action === 'manage')
      )

    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Get team activity logs
   */
  static async getActivityLogs(
    organizationId: string,
    planId: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const limits = this.getTeamLimits(planId)
    if (!limits.hasActivityLogs) {
      return []
    }

    // Mock implementation - in real app, query database
    return []
  }

  /**
   * Create team notification
   */
  static async createNotification(
    organizationId: string,
    userId: string | null,
    notification: Omit<TeamNotification, 'id' | 'organizationId' | 'userId' | 'createdAt'>
  ): Promise<void> {
    const teamNotification: TeamNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      userId: userId || undefined,
      ...notification,
      createdAt: new Date()
    }

    // Store notification (mock)
    await this.storeNotification(teamNotification)
  }

  // Mock database methods (in real app, these would interact with your database)
  private static async getTeamMemberCount(organizationId: string): Promise<number> {
    // Mock: return current team size
    return 2
  }

  private static async findTeamMember(organizationId: string, email: string): Promise<TeamMember | null> {
    // Mock: check if user is already a member
    return null
  }

  private static async findPendingInvitation(organizationId: string, email: string): Promise<TeamInvitation | null> {
    return null
  }

  private static async findTeamMemberById(organizationId: string, memberId: string): Promise<TeamMember | null> {
    return null
  }

  private static async findTeamMemberByUserId(organizationId: string, userId: string): Promise<TeamMember | null> {
    return null
  }

  private static async getOwnerCount(organizationId: string): Promise<number> {
    return 1
  }

  private static async findInvitationByToken(token: string): Promise<TeamInvitation | null> {
    return null
  }

  private static async getUserName(userId: string): Promise<string> {
    return 'User Name'
  }

  private static generateInvitationToken(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }

  // Storage methods (mock implementations)
  private static async storeInvitation(invitation: TeamInvitation): Promise<void> {
    console.log('Storing invitation:', invitation.id)
  }

  private static async storeTeamMember(member: TeamMember): Promise<void> {
    console.log('Storing team member:', member.id)
  }

  private static async updateInvitation(invitation: TeamInvitation): Promise<void> {
    console.log('Updating invitation:', invitation.id)
  }

  private static async updateTeamMember_DB(member: TeamMember): Promise<void> {
    console.log('Updating team member:', member.id)
  }

  private static async deleteTeamMember(organizationId: string, memberId: string): Promise<void> {
    console.log('Deleting team member:', memberId)
  }

  private static async logActivity(
    organizationId: string,
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>
  ): Promise<void> {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      userId,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date()
    }
    console.log('Logging activity:', log)
  }

  private static async storeNotification(notification: TeamNotification): Promise<void> {
    console.log('Storing notification:', notification.id)
  }

  private static async sendInvitationEmail(invitation: TeamInvitation): Promise<void> {
    console.log(`Sending invitation email to ${invitation.email}`)
    // In real implementation, integrate with email service
  }
} 