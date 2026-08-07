import type { 
  AIAsset, 
  User, 
  AuditLog, 
  GovernanceMetrics, 
  DecisionRecord,
  ValidationRecord,
  EvidenceDocument,
  Finding
} from '../types';
import { 
  INITIAL_ASSETS, 
  INITIAL_USERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_VALIDATIONS, 
  INITIAL_EVIDENCE, 
  INITIAL_FINDINGS 
} from './mockData';

const STORAGE_KEYS = {
  ASSETS: 'omg_assets_v3',
  USERS: 'omg_users_v3',
  AUDIT_LOGS: 'omg_audit_logs_v3',
  RISK_ASSESSMENTS: 'omg_risk_assessments_v3',
  DECISIONS: 'omg_decisions_v3',
  VALIDATIONS: 'omg_validations_v3',
  EVIDENCE: 'omg_evidence_v3',
  FINDINGS: 'omg_findings_v3',
};

// Helper: Generic LocalStorage Getter
function getItem<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultData;
  }
}

// Helper: Generic LocalStorage Setter
function setItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// --- AUDIT LOG SERVICE ---
export function addAuditLog(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  entityType: 'Asset' | 'User' | 'Ownership' | 'Risk' | 'Decision' | 'Validation' | 'Evidence' | 'Finding',
  entityId: string,
  entityName: string,
  details: string
): AuditLog {
  const logs = getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp,
    userId,
    userName,
    userRole,
    action,
    entityType,
    entityId,
    entityName,
    details,
    ipAddress: '127.0.0.1 (Local)',
  };

  const updatedLogs = [newLog, ...logs];
  setItem(STORAGE_KEYS.AUDIT_LOGS, updatedLogs);
  return newLog;
}

export function getAuditLogs(): AuditLog[] {
  return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

// --- AI ASSETS SERVICE ---
export function getAssets(): AIAsset[] {
  return getItem<AIAsset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
}

export function getAssetById(id: string): AIAsset | undefined {
  return getAssets().find(a => a.id === id);
}

export function saveAsset(assetData: Partial<AIAsset>): AIAsset {
  const assets = getAssets();
  const now = new Date().toISOString().split('T')[0];

  if (assetData.id) {
    const index = assets.findIndex(a => a.id === assetData.id);
    if (index !== -1) {
      const updatedAsset: AIAsset = {
        ...assets[index],
        ...assetData,
        updatedAt: now,
      };
      assets[index] = updatedAsset;
      setItem(STORAGE_KEYS.ASSETS, assets);

      addAuditLog(
        'usr-1',
        'Sarah Jenkins',
        'SUPER_ADMIN',
        'ASSET_UPDATED',
        'Asset',
        updatedAsset.id,
        updatedAsset.name,
        `Updated asset details for ${updatedAsset.name} (v${updatedAsset.version})`
      );

      return updatedAsset;
    }
  }

  // Create New Asset
  const newAsset: AIAsset = {
    id: `ast-${Date.now().toString().slice(-4)}`,
    name: assetData.name || 'New AI Asset',
    type: assetData.type || 'Agent',
    description: assetData.description || '',
    department: assetData.department || 'Enterprise AI',
    version: assetData.version || '1.0.0',
    status: assetData.status || 'Draft',
    riskLevel: assetData.riskLevel || 'Medium',
    ownership: assetData.ownership || {},
    techStack: assetData.techStack || [],
    dataSensitivity: assetData.dataSensitivity || 'Confidential',
    validationScore: 0,
    createdAt: now,
    updatedAt: now,
    decisionOutcome: 'PENDING',
    tags: assetData.tags || [],
  };

  const updatedAssets = [newAsset, ...assets];
  setItem(STORAGE_KEYS.ASSETS, updatedAssets);

  addAuditLog(
    'usr-1',
    'Sarah Jenkins',
    'SUPER_ADMIN',
    'ASSET_CREATED',
    'Asset',
    newAsset.id,
    newAsset.name,
    `Registered new AI asset ${newAsset.name} [${newAsset.type}] in ${newAsset.department}`
  );

  return newAsset;
}

export function deleteAsset(id: string): void {
  const assets = getAssets();
  const target = assets.find(a => a.id === id);
  if (target) {
    const updated = assets.filter(a => a.id !== id);
    setItem(STORAGE_KEYS.ASSETS, updated);

    addAuditLog(
      'usr-1',
      'Sarah Jenkins',
      'SUPER_ADMIN',
      'ASSET_DELETED',
      'Asset',
      id,
      target.name,
      `Deleted asset ${target.name} from registry.`
    );
  }
}

// --- DECISION GOVERNANCE SERVICE ---
export function recordDecision(recordData: Partial<DecisionRecord>): DecisionRecord {
  const decisions = getItem<DecisionRecord[]>(STORAGE_KEYS.DECISIONS, []);
  const now = new Date().toISOString().split('T')[0];

  const newRecord: DecisionRecord = {
    id: `dec-${Date.now().toString().slice(-4)}`,
    assetId: recordData.assetId || '',
    outcome: recordData.outcome || 'PENDING',
    checklist: recordData.checklist || {
      ownershipComplete: false,
      riskAssessmentComplete: false,
      requiredReviewsComplete: false,
      validationComplete: false,
      monitoringDefined: false,
      auditRequirementsMet: false,
      humanOverrideAvailable: false,
      killSwitchDefined: false,
    },
    decisionOwner: recordData.decisionOwner || 'David Chen',
    decisionDate: now,
    justification: recordData.justification || '',
    conditions: recordData.conditions || [],
  };

  const updated = [newRecord, ...decisions];
  setItem(STORAGE_KEYS.DECISIONS, updated);

  // Update AI Asset Decision Outcome
  if (recordData.assetId) {
    const asset = getAssetById(recordData.assetId);
    if (asset) {
      asset.decisionOutcome = recordData.outcome;
      if (recordData.outcome === 'GO') asset.status = 'Production';
      saveAsset(asset);
    }
  }

  addAuditLog(
    'usr-2',
    newRecord.decisionOwner,
    'GOVERNANCE_ADMIN',
    'DECISION_EXECUTED',
    'Decision',
    newRecord.assetId,
    'Decision Gatekeeper',
    `Executed Decision Outcome: ${newRecord.outcome}. Justification: ${newRecord.justification}`
  );

  return newRecord;
}

// --- USERS SERVICE ---
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUser(userData: Partial<User>): User {
  const users = getUsers();
  if (userData.id) {
    const index = users.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      setItem(STORAGE_KEYS.USERS, users);
      return users[index];
    }
  }

  const newUser: User = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: userData.name || 'New User',
    email: userData.email || '',
    role: userData.role || 'GOVERNANCE_ADMIN',
    department: userData.department || 'AI Governance Office',
    status: 'Active',
    assignedAssetsCount: 0,
  };

  const updated = [newUser, ...users];
  setItem(STORAGE_KEYS.USERS, updated);
  return newUser;
}

export function toggleUserStatus(id: string): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index].status = users[index].status === 'Active' ? 'Inactive' : 'Active';
    setItem(STORAGE_KEYS.USERS, users);
  }
}

// --- PHASE 3: VALIDATION SERVICE ---
export function getValidations(): ValidationRecord[] {
  return getItem<ValidationRecord[]>(STORAGE_KEYS.VALIDATIONS, INITIAL_VALIDATIONS);
}

export function saveValidation(valData: Partial<ValidationRecord>): ValidationRecord {
  const validations = getValidations();
  const now = new Date().toISOString().split('T')[0];

  if (valData.id) {
    const idx = validations.findIndex(v => v.id === valData.id);
    if (idx !== -1) {
      validations[idx] = { ...validations[idx], ...valData, reviewDate: now };
      setItem(STORAGE_KEYS.VALIDATIONS, validations);
      recalculateAssetValidationScore(validations[idx].assetId);
      return validations[idx];
    }
  }

  const newVal: ValidationRecord = {
    id: `val-${Date.now().toString().slice(-4)}`,
    assetId: valData.assetId || 'ast-101',
    assetName: valData.assetName || 'AI Asset',
    category: valData.category || 'Business',
    reviewer: valData.reviewer || 'Dr. Aris Thorne',
    reviewerRole: valData.reviewerRole || 'VALIDATOR',
    reviewDate: now,
    status: valData.status || 'In Review',
    score: valData.score ?? 100,
    findings: valData.findings || '',
    recommendations: valData.recommendations || '',
    evidenceRefs: valData.evidenceRefs || [],
  };

  const updated = [newVal, ...validations];
  setItem(STORAGE_KEYS.VALIDATIONS, updated);

  addAuditLog(
    'usr-5',
    newVal.reviewer,
    newVal.reviewerRole,
    'VALIDATION_SUBMITTED',
    'Validation',
    newVal.id,
    newVal.assetName,
    `Submitted ${newVal.category} Validation for ${newVal.assetName}. Outcome: ${newVal.status} (Score: ${newVal.score})`
  );

  recalculateAssetValidationScore(newVal.assetId);
  return newVal;
}

function recalculateAssetValidationScore(assetId: string) {
  const validations = getValidations().filter(v => v.assetId === assetId && v.status === 'Approved');
  const asset = getAssetById(assetId);
  if (!asset) return;

  if (validations.length === 0) {
    asset.validationScore = 0;
  } else {
    const totalScore = validations.reduce((acc, v) => acc + v.score, 0);
    asset.validationScore = Math.round(totalScore / validations.length);
  }
  saveAsset(asset);
}

// --- PHASE 3: EVIDENCE SERVICE ---
export function getEvidence(): EvidenceDocument[] {
  return getItem<EvidenceDocument[]>(STORAGE_KEYS.EVIDENCE, INITIAL_EVIDENCE);
}

export function saveEvidence(evdData: Partial<EvidenceDocument>): EvidenceDocument {
  const evidenceList = getEvidence();
  const now = new Date().toISOString().split('T')[0];

  if (evdData.id) {
    const idx = evidenceList.findIndex(e => e.id === evdData.id);
    if (idx !== -1) {
      evidenceList[idx] = { ...evidenceList[idx], ...evdData };
      setItem(STORAGE_KEYS.EVIDENCE, evidenceList);
      return evidenceList[idx];
    }
  }

  const newEvd: EvidenceDocument = {
    id: `evd-${Date.now().toString().slice(-4)}`,
    title: evdData.title || 'New Governance Evidence Document',
    category: evdData.category || 'Business Evidence',
    deliverableType: evdData.deliverableType || 'Functional Requirements Specification',
    assetId: evdData.assetId || 'ast-101',
    assetName: evdData.assetName || 'AI Asset',
    uploadedBy: evdData.uploadedBy || 'Sarah Jenkins',
    uploadDate: now,
    version: evdData.version || '1.0',
    status: evdData.status || 'Submitted',
    description: evdData.description || '',
  };

  const updated = [newEvd, ...evidenceList];
  setItem(STORAGE_KEYS.EVIDENCE, updated);

  addAuditLog(
    'usr-1',
    newEvd.uploadedBy,
    'BUSINESS_OWNER',
    'EVIDENCE_UPLOADED',
    'Evidence',
    newEvd.id,
    newEvd.title,
    `Uploaded ${newEvd.deliverableType} [${newEvd.category}] for ${newEvd.assetName}`
  );

  return newEvd;
}

// --- PHASE 3: FINDINGS SERVICE ---
export function getFindings(): Finding[] {
  return getItem<Finding[]>(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
}

export function saveFinding(findingData: Partial<Finding>): Finding {
  const findings = getFindings();
  const now = new Date().toISOString().split('T')[0];

  if (findingData.id) {
    const idx = findings.findIndex(f => f.id === findingData.id);
    if (idx !== -1) {
      findings[idx] = { ...findings[idx], ...findingData };
      setItem(STORAGE_KEYS.FINDINGS, findings);
      return findings[idx];
    }
  }

  const newFinding: Finding = {
    id: `fnd-${Date.now().toString().slice(-4)}`,
    title: findingData.title || 'Governance Finding',
    assetId: findingData.assetId || 'ast-101',
    assetName: findingData.assetName || 'AI Asset',
    severity: findingData.severity || 'Medium',
    status: findingData.status || 'Open',
    assignedTo: findingData.assignedTo || 'Sarah Jenkins',
    reportedBy: findingData.reportedBy || 'Dr. Aris Thorne',
    reportedDate: now,
    description: findingData.description || '',
  };

  const updated = [newFinding, ...findings];
  setItem(STORAGE_KEYS.FINDINGS, updated);

  addAuditLog(
    'usr-5',
    newFinding.reportedBy,
    'VALIDATOR',
    'FINDING_CREATED',
    'Finding',
    newFinding.id,
    newFinding.title,
    `Logged ${newFinding.severity} severity finding: ${newFinding.title} for ${newFinding.assetName}`
  );

  return newFinding;
}

// --- GOVERNANCE METRICS CALCULATION ---
export function getGovernanceMetrics(): GovernanceMetrics {
  const assets = getAssets();
  const validations = getValidations();
  const findings = getFindings();
  const evidence = getEvidence();

  const metrics: GovernanceMetrics = {
    totalAssets: assets.length,
    assetsByType: {
      'Application': 0, 'Agent': 0, 'Model': 0, 'LLM': 0,
      'Copilot': 0, 'RAG System': 0, 'AI Workflow': 0,
      'Multi-Agent System': 0, 'Third-Party AI Service': 0,
    },
    riskBreakdown: { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
    statusBreakdown: { 'Draft': 0, 'Review': 0, 'Validation': 0, 'Approval': 0, 'Production': 0, 'Retirement': 0 },
    pendingReviewsCount: 0,
    pendingValidationCount: 0,
    decisionBreakdown: { 'GO': 0, 'CONDITIONAL GO': 0, 'NO GO': 0, 'PENDING': 0 },
    ownershipCompletionRate: 0,
    highRiskUnapprovedCount: 0,
    totalValidations: validations.length,
    passedValidations: validations.filter(v => v.status === 'Approved').length,
    failedValidations: validations.filter(v => v.status === 'Rejected').length,
    openFindingsCount: findings.filter(f => f.status === 'Open' || f.status === 'In Progress').length,
    totalEvidenceCount: evidence.length,
  };

  let completeOwnershipCount = 0;

  assets.forEach(asset => {
    if (metrics.assetsByType[asset.type] !== undefined) metrics.assetsByType[asset.type]++;
    if (metrics.riskBreakdown[asset.riskLevel] !== undefined) metrics.riskBreakdown[asset.riskLevel]++;
    if (metrics.statusBreakdown[asset.status] !== undefined) metrics.statusBreakdown[asset.status]++;

    const outcome = asset.decisionOutcome || 'PENDING';
    if (metrics.decisionBreakdown[outcome] !== undefined) metrics.decisionBreakdown[outcome]++;

    if (asset.status === 'Review') metrics.pendingReviewsCount++;
    if (asset.status === 'Validation') metrics.pendingValidationCount++;

    const o = asset.ownership || {};
    if (o.businessOwner && o.technicalOwner && o.riskOwner && o.complianceOwner && o.approver) {
      completeOwnershipCount++;
    }

    if ((asset.riskLevel === 'High' || asset.riskLevel === 'Critical') && outcome !== 'GO') {
      metrics.highRiskUnapprovedCount++;
    }
  });

  metrics.ownershipCompletionRate = assets.length > 0 ? Math.round((completeOwnershipCount / assets.length) * 100) : 0;
  return metrics;
}
