import type { 
  AIAsset, 
  User, 
  AuditLog, 
  GovernanceMetrics, 
  DecisionRecord,
  ValidationRecord,
  EvidenceDocument,
  Finding,
  GovernanceScoreBreakdown,
  GovernanceBlocker,
  DecisionPackage,
  DecisionOutcome
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
  ASSETS: 'omg_assets_v4',
  USERS: 'omg_users_v4',
  AUDIT_LOGS: 'omg_audit_logs_v4',
  RISK_ASSESSMENTS: 'omg_risk_assessments_v4',
  DECISIONS: 'omg_decisions_v4',
  VALIDATIONS: 'omg_validations_v4',
  EVIDENCE: 'omg_evidence_v4',
  FINDINGS: 'omg_findings_v4',
  PACKAGES: 'omg_decision_packages_v4',
};

function getItem<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultData;
  }
}

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
  entityType: 'Asset' | 'User' | 'Ownership' | 'Risk' | 'Decision' | 'Validation' | 'Evidence' | 'Finding' | 'DecisionPackage',
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

// --- VALIDATION SERVICE ---
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

// --- EVIDENCE SERVICE ---
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

// --- FINDINGS SERVICE ---
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

// --- PHASE 4: 5-PILLAR GOVERNANCE SCORING ENGINE (20% x 5 = 100 TOTAL) ---
export function calculateAssetGovernanceScore(assetId: string): GovernanceScoreBreakdown {
  const asset = getAssetById(assetId);
  const validations = getValidations().filter(v => v.assetId === assetId);
  const evidence = getEvidence().filter(e => e.assetId === assetId);
  const findings = getFindings().filter(f => f.assetId === assetId);

  if (!asset) {
    return {
      ownership: { score: 0, passed: false, message: 'Asset not found' },
      risk: { score: 0, passed: false, message: 'Asset not found' },
      validation: { score: 0, passed: false, message: 'Asset not found' },
      evidence: { score: 0, passed: false, message: 'Asset not found' },
      findings: { score: 0, passed: false, message: 'Asset not found' },
      overallScore: 0,
      readinessTier: 'Not Ready',
      recommendedOutcome: 'NO GO',
    };
  }

  // Pillar 1: Ownership (20%)
  const o = asset.ownership || {};
  const ownershipPassed = !!(o.businessOwner && o.technicalOwner && o.riskOwner);
  const ownershipScore = ownershipPassed ? 20 : o.businessOwner ? 10 : 0;

  // Pillar 2: Risk (20%)
  const riskPassed = !!asset.riskLevel && asset.riskLevel !== 'Low'; // Risk assessment executed
  const riskScore = riskPassed ? 20 : 10;

  // Pillar 3: Validation (20%)
  const approvedVals = validations.filter(v => v.status === 'Approved');
  const valPassed = approvedVals.length > 0 && (asset.validationScore || 0) >= 80;
  const validationScore = valPassed ? 20 : approvedVals.length > 0 ? 10 : 0;

  // Pillar 4: Evidence (20%)
  const approvedEvd = evidence.filter(e => e.status === 'Approved');
  const evidencePassed = approvedEvd.length > 0;
  const evidenceScore = evidencePassed ? 20 : evidence.length > 0 ? 10 : 0;

  // Pillar 5: Findings (20%)
  const criticalOpen = findings.some(f => f.severity === 'Critical' && f.status !== 'Resolved' && f.status !== 'Verified');
  const highOpen = findings.some(f => f.severity === 'High' && f.status !== 'Resolved' && f.status !== 'Verified');
  const findingsPassed = !criticalOpen && !highOpen;
  const findingsScore = findingsPassed ? 20 : criticalOpen ? 0 : 10;

  const overallScore = ownershipScore + riskScore + validationScore + evidenceScore + findingsScore;

  let readinessTier: 'Ready' | 'Conditionally Ready' | 'Not Ready' = 'Not Ready';
  let recommendedOutcome: DecisionOutcome = 'NO GO';

  if (overallScore >= 90 && !criticalOpen) {
    readinessTier = 'Ready';
    recommendedOutcome = 'GO';
  } else if (overallScore >= 70 && !criticalOpen) {
    readinessTier = 'Conditionally Ready';
    recommendedOutcome = 'CONDITIONAL GO';
  } else {
    readinessTier = 'Not Ready';
    recommendedOutcome = 'NO GO';
  }

  return {
    ownership: {
      score: ownershipScore,
      passed: ownershipPassed,
      message: ownershipPassed ? 'All key ownership roles assigned.' : 'Missing Business, Technical, or Risk Owner.',
    },
    risk: {
      score: riskScore,
      passed: riskPassed,
      message: riskPassed ? `Risk Assessment complete (Tier: ${asset.riskLevel}).` : 'Risk Assessment incomplete.',
    },
    validation: {
      score: validationScore,
      passed: valPassed,
      message: valPassed ? `Validation Score: ${asset.validationScore}% (>=80% threshold passed).` : 'Validation incomplete or score < 80%.',
    },
    evidence: {
      score: evidenceScore,
      passed: evidencePassed,
      message: evidencePassed ? `${approvedEvd.length} Evidence Artifacts approved.` : 'No approved evidence uploaded.',
    },
    findings: {
      score: findingsScore,
      passed: findingsPassed,
      message: findingsPassed ? 'Zero critical or high risk findings open.' : criticalOpen ? 'CRITICAL FINDING OPEN - Blocker' : 'High findings pending resolution.',
    },
    overallScore,
    readinessTier,
    recommendedOutcome,
  };
}

// --- PHASE 4: GOVERNANCE BLOCKERS EVALUATOR ---
export function getGovernanceBlockers(assetId?: string): GovernanceBlocker[] {
  const assets = assetId ? getAssets().filter(a => a.id === assetId) : getAssets();
  const blockers: GovernanceBlocker[] = [];

  assets.forEach(asset => {
    const o = asset.ownership || {};
    if (!o.businessOwner || !o.technicalOwner || !o.riskOwner) {
      blockers.push({
        id: `blk-${asset.id}-own`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Ownership',
        blockerMessage: `Incomplete Ownership Matrix for ${asset.name}. Missing assigned owners.`,
        severity: 'High',
        remediationPath: '/ownership',
      });
    }

    const scoreDetails = calculateAssetGovernanceScore(asset.id);
    if (!scoreDetails.validation.passed) {
      blockers.push({
        id: `blk-${asset.id}-val`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Validation',
        blockerMessage: `Validation score is ${asset.validationScore || 0}% (Required >= 80%).`,
        severity: 'High',
        remediationPath: '/validation',
      });
    }

    if (!scoreDetails.evidence.passed) {
      blockers.push({
        id: `blk-${asset.id}-evd`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Evidence',
        blockerMessage: `No approved evidence artifacts uploaded for ODF Blueprint v1 deliverables.`,
        severity: 'Medium',
        remediationPath: '/evidence',
      });
    }

    const openCriticalFinding = getFindings().find(f => f.assetId === asset.id && f.severity === 'Critical' && f.status !== 'Resolved' && f.status !== 'Verified');
    if (openCriticalFinding) {
      blockers.push({
        id: `blk-${asset.id}-fnd`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Findings',
        blockerMessage: `Critical Finding Open: '${openCriticalFinding.title}'.`,
        severity: 'Critical',
        remediationPath: '/findings',
      });
    }
  });

  return blockers;
}

// --- DECISION GOVERNANCE RECORD SERVICE ---
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

// --- PHASE 4: EXECUTIVE DECISION PACKAGE GENERATOR ---
export function generateDecisionPackage(assetId: string, authorName: string): DecisionPackage {
  const packages = getItem<DecisionPackage[]>(STORAGE_KEYS.PACKAGES, []);
  const asset = getAssetById(assetId) || getAssets()[0];
  const scoreBreakdown = calculateAssetGovernanceScore(asset.id);
  const evidence = getEvidence().filter(e => e.assetId === asset.id);
  const findings = getFindings().filter(f => f.assetId === asset.id);
  const now = new Date().toISOString().split('T')[0];

  const pkg: DecisionPackage = {
    id: `pkg-${Date.now().toString().slice(-4)}`,
    assetId: asset.id,
    assetName: asset.name,
    assetType: asset.type,
    generatedAt: now,
    generatedBy: authorName,
    governanceScore: scoreBreakdown.overallScore,
    readinessTier: scoreBreakdown.readinessTier,
    recommendedOutcome: scoreBreakdown.recommendedOutcome,
    actualOutcome: asset.decisionOutcome || scoreBreakdown.recommendedOutcome,
    justification: `Executive Decision Briefing Package generated for ${asset.name}. Governance score: ${scoreBreakdown.overallScore}/100.`,
    deliverablesCount: evidence.length,
    findingsCount: findings.length,
    ownersSummary: asset.ownership || {},
  };

  const updated = [pkg, ...packages];
  setItem(STORAGE_KEYS.PACKAGES, updated);

  addAuditLog(
    'usr-1',
    authorName,
    'GOVERNANCE_ADMIN',
    'DECISION_PACKAGE_GENERATED',
    'DecisionPackage',
    pkg.id,
    pkg.assetName,
    `Generated Executive Governance Decision Briefing Package for ${pkg.assetName}`
  );

  return pkg;
}

// --- METRICS WITH PHASE 4 EXTENSIONS ---
export function getGovernanceMetrics(): GovernanceMetrics {
  const assets = getAssets();
  const validations = getValidations();
  const findings = getFindings();
  const evidence = getEvidence();
  const blockers = getGovernanceBlockers();

  let readyCount = 0;
  let condReadyCount = 0;
  let notReadyCount = 0;

  assets.forEach(asset => {
    const score = calculateAssetGovernanceScore(asset.id);
    if (score.readinessTier === 'Ready') readyCount++;
    else if (score.readinessTier === 'Conditionally Ready') condReadyCount++;
    else notReadyCount++;
  });

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
    readyAssetsCount: readyCount,
    conditionallyReadyAssetsCount: condReadyCount,
    notReadyAssetsCount: notReadyCount,
    totalBlockersCount: blockers.length,
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
