import type { 
  AIAsset, 
  User, 
  AuditLog, 
  GovernanceMetrics, 
  AssetType, 
  RiskLevel, 
  GovernanceStatus, 
  DecisionOutcome,
  DecisionRecord
} from '../types';
import { INITIAL_ASSETS, INITIAL_USERS, INITIAL_AUDIT_LOGS } from './mockData';

const STORAGE_KEYS = {
  ASSETS: 'omg_assets_v1',
  USERS: 'omg_users_v1',
  AUDIT: 'omg_audit_v1',
  DECISIONS: 'omg_decisions_v1',
  RISK_ASSESSMENTS: 'omg_risk_assessments_v1',
};

// Helper for local storage retrieval with fallback
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// ------------------- ASSET SERVICES -------------------

export function getAssets(): AIAsset[] {
  return getStored<AIAsset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
}

export function getAssetById(id: string): AIAsset | undefined {
  return getAssets().find(a => a.id === id);
}

export function saveAsset(asset: Omit<AIAsset, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): AIAsset {
  const assets = getAssets();
  const now = new Date().toISOString().split('T')[0];

  if (asset.id) {
    // Update
    const index = assets.findIndex(a => a.id === asset.id);
    if (index !== -1) {
      const updated: AIAsset = {
        ...assets[index],
        ...asset,
        updatedAt: now,
      };
      assets[index] = updated;
      setStored(STORAGE_KEYS.ASSETS, assets);
      logAuditAction('ASSET_UPDATED', 'Asset', updated.id, updated.name, `Updated asset configuration & status (${updated.status})`);
      return updated;
    }
  }

  // Create
  const newAsset: AIAsset = {
    ...asset,
    id: `ast-${Date.now().toString().slice(-4)}`,
    createdAt: now,
    updatedAt: now,
    riskLevel: asset.riskLevel || 'Medium',
    status: asset.status || 'Draft',
    decisionOutcome: asset.decisionOutcome || 'PENDING',
    ownership: asset.ownership || {},
  };
  
  assets.unshift(newAsset);
  setStored(STORAGE_KEYS.ASSETS, assets);
  logAuditAction('ASSET_CREATED', 'Asset', newAsset.id, newAsset.name, `Registered new AI Asset: ${newAsset.name} (${newAsset.type})`);
  return newAsset;
}

export function deleteAsset(id: string): boolean {
  const assets = getAssets();
  const target = assets.find(a => a.id === id);
  if (!target) return false;

  const filtered = assets.filter(a => a.id !== id);
  setStored(STORAGE_KEYS.ASSETS, filtered);
  logAuditAction('ASSET_DELETED', 'Asset', id, target.name, `Deleted AI Asset ${target.name}`);
  return true;
}

// ------------------- USER SERVICES -------------------

export function getUsers(): User[] {
  return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUser(user: Omit<User, 'id'> & { id?: string }): User {
  const users = getUsers();
  if (user.id) {
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      const updated = { ...users[index], ...user };
      users[index] = updated;
      setStored(STORAGE_KEYS.USERS, users);
      logAuditAction('USER_UPDATED', 'User', updated.id, updated.name, `Updated user profile & role to ${updated.role}`);
      return updated;
    }
  }

  const newUser: User = {
    ...user,
    id: `usr-${Date.now().toString().slice(-3)}`,
    assignedAssetsCount: 0,
    status: user.status || 'Active',
  };
  users.unshift(newUser);
  setStored(STORAGE_KEYS.USERS, users);
  logAuditAction('USER_CREATED', 'User', newUser.id, newUser.name, `Created application user ${newUser.name} (${newUser.role})`);
  return newUser;
}

export function toggleUserStatus(id: string): User | undefined {
  const users = getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return undefined;

  user.status = user.status === 'Active' ? 'Inactive' : 'Active';
  setStored(STORAGE_KEYS.USERS, users);
  logAuditAction('USER_STATUS_CHANGED', 'User', user.id, user.name, `Toggled user status to ${user.status}`);
  return user;
}

// ------------------- AUDIT LOG SERVICES -------------------

export function getAuditLogs(): AuditLog[] {
  return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
}

export function logAuditAction(
  action: string,
  entityType: 'Asset' | 'User' | 'Ownership' | 'Risk' | 'Decision',
  entityId: string,
  entityName: string,
  details: string
): AuditLog {
  const logs = getAuditLogs();
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
  
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp,
    userId: 'usr-1',
    userName: 'Sarah Jenkins (Current User)',
    userRole: 'Super Admin',
    action,
    entityType,
    entityId,
    entityName,
    details,
    ipAddress: '127.0.0.1',
  };

  logs.unshift(newLog);
  setStored(STORAGE_KEYS.AUDIT, logs);
  return newLog;
}

// ------------------- DECISION GOVERNANCE SERVICES -------------------

export function recordDecision(assetId: string, outcome: DecisionOutcome, justification: string, checklist: any): DecisionRecord {
  const decisions = getStored<DecisionRecord[]>(STORAGE_KEYS.DECISIONS, []);
  const assets = getAssets();

  const record: DecisionRecord = {
    id: `dec-${Date.now()}`,
    assetId,
    outcome,
    checklist,
    decisionOwner: 'Sarah Jenkins',
    decisionDate: new Date().toISOString().split('T')[0],
    justification,
  };

  decisions.unshift(record);
  setStored(STORAGE_KEYS.DECISIONS, decisions);

  // Update Asset outcome & status
  const assetIndex = assets.findIndex(a => a.id === assetId);
  if (assetIndex !== -1) {
    assets[assetIndex].decisionOutcome = outcome;
    if (outcome === 'GO') {
      assets[assetIndex].status = 'Production';
    } else if (outcome === 'NO GO') {
      assets[assetIndex].status = 'Draft';
    }
    setStored(STORAGE_KEYS.ASSETS, assets);
  }

  logAuditAction('DECISION_EXECUTED', 'Decision', assetId, assets[assetIndex]?.name || assetId, `Executed Governance Decision: ${outcome}. Justification: ${justification}`);

  return record;
}

// ------------------- GOVERNANCE METRICS -------------------

export function getGovernanceMetrics(): GovernanceMetrics {
  const assets = getAssets();
  
  const assetsByType: Record<AssetType, number> = {
    'Application': 0,
    'Agent': 0,
    'Model': 0,
    'LLM': 0,
    'Copilot': 0,
    'RAG System': 0,
    'AI Workflow': 0,
    'Multi-Agent System': 0,
    'Third-Party AI Service': 0,
  };

  const riskBreakdown: Record<RiskLevel, number> = {
    'Low': 0,
    'Medium': 0,
    'High': 0,
    'Critical': 0,
  };

  const statusBreakdown: Record<GovernanceStatus, number> = {
    'Draft': 0,
    'Review': 0,
    'Validation': 0,
    'Approval': 0,
    'Production': 0,
    'Retirement': 0,
  };

  const decisionBreakdown: Record<DecisionOutcome, number> = {
    'GO': 0,
    'CONDITIONAL GO': 0,
    'NO GO': 0,
    'PENDING': 0,
  };

  let completeOwnershipCount = 0;
  let highRiskUnapprovedCount = 0;

  assets.forEach(a => {
    if (assetsByType[a.type] !== undefined) assetsByType[a.type]++;
    if (riskBreakdown[a.riskLevel] !== undefined) riskBreakdown[a.riskLevel]++;
    if (statusBreakdown[a.status] !== undefined) statusBreakdown[a.status]++;
    
    const outcome = a.decisionOutcome || 'PENDING';
    if (decisionBreakdown[outcome] !== undefined) decisionBreakdown[outcome]++;

    // Check ownership completeness (all 5 roles filled)
    const o = a.ownership || {};
    if (o.businessOwner && o.technicalOwner && o.riskOwner && o.complianceOwner && o.approver) {
      completeOwnershipCount++;
    }

    if ((a.riskLevel === 'High' || a.riskLevel === 'Critical') && a.decisionOutcome !== 'GO') {
      highRiskUnapprovedCount++;
    }
  });

  const totalAssets = assets.length;
  const ownershipCompletionRate = totalAssets > 0 ? Math.round((completeOwnershipCount / totalAssets) * 100) : 0;

  return {
    totalAssets,
    assetsByType,
    riskBreakdown,
    statusBreakdown,
    pendingReviewsCount: statusBreakdown['Review'] + statusBreakdown['Draft'],
    pendingValidationCount: statusBreakdown['Validation'],
    decisionBreakdown,
    ownershipCompletionRate,
    highRiskUnapprovedCount,
  };
}
