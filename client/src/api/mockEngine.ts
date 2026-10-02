import type { 
  User, Issue, IssueCategory, IssuePriority, IssueStatus, 
  AreaType, HecticLevel, StatusHistoryEntry, Comment, Story,
  AnalyticsSummary, MonthlyData, CategoryData, WardData, SLAItem
} from '@/types';
import { PUDUCHERRY_AUTHENTIC_PINS } from '@/utils/mapFallbacks';

// ─── Predefined Demo Accounts ──────────────────────────────────────────────────
export const PREDEFINED_USERS: Record<string, { user: User; passwordHash: string }> = {
  'citizen@civitrack.in': {
    passwordHash: 'citizen123',
    user: {
      id: 'usr-citizen-01',
      name: 'Aravindhan Sundar',
      email: 'citizen@civitrack.in',
      role: 'CITIZEN',
      ward: 'Lawspet',
      language: 'en',
      eco_score: 185,
      level: 'GUARDIAN',
      streak: 7,
      achievements: ['FIRST_REPORT', 'COMMUNITY_VOICE', 'ECO_CHAMPION'],
      created_at: '2026-08-01T10:00:00Z',
    },
  },
  'ngo.whitetown@civitrack.in': {
    passwordHash: 'ngo123',
    user: {
      id: 'usr-ngo-01',
      name: 'Clean Pondy Trust NGO',
      email: 'ngo.whitetown@civitrack.in',
      role: 'NGO',
      ward: 'White Town',
      language: 'en',
      eco_score: 540,
      level: 'ECO_CHAMPION',
      streak: 18,
      achievements: ['VERIFIED_GUARDIAN', 'COMMUNITY_HERO'],
      created_at: '2026-07-15T09:30:00Z',
    },
  },
  'authority@civitrack.in': {
    passwordHash: 'authority123',
    user: {
      id: 'usr-auth-01',
      name: 'Puducherry Municipal Commissioner',
      email: 'authority@civitrack.in',
      role: 'AUTHORITY',
      ward: 'Lawspet',
      language: 'en',
      eco_score: 950,
      level: 'ECO_CHAMPION',
      streak: 30,
      achievements: ['SYSTEM_ADMIN', 'URBAN_SOLVER'],
      created_at: '2026-06-01T08:00:00Z',
    },
  },
};

// ─── LocalStorage Keys ────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  USERS: 'civitrack_demo_users',
  ISSUES: 'civitrack_demo_issues',
  STORIES: 'civitrack_demo_stories',
  NOTIFICATIONS: 'civitrack_demo_notifications',
};

// ─── Initial Issue Seed Generator ─────────────────────────────────────────────
const REALISTIC_DESCRIPTIONS: Record<string, string> = {
  'WATER': 'Severe stormwater drain silt accumulation causing monsoon runoff backing up onto pedestrian walkways and French colonial shop entrances. Requires high-velocity suction flushing and canal silt clearing.',
  'PUBLIC_PROPERTY': 'Corrosive sea-spray atmospheric exposure has fractured decorative steel and concrete balustrades along the seaside promenade, posing safety hazard to tourists and morning walkers.',
  'ROADS': 'Continuous monsoon rainwater runoff has eroded sub-base asphalt layers, forming recurrent 25cm deep crater potholes that cause dangerous motorcycle skidding near busy school transit zones.',
  'LIGHTING': 'High-mast overhead lighting junction experienced luminaire capacitor burnout, creating hazardous night-time blind spots at heavy coastal highway merge intersections.',
  'WASTE': 'Commercial plastic packaging and unsegregated vegetable waste dumping overflowing beyond municipal secondary bin enclosures, blocking stormwater grates and attracting stray cattle.',
  'AIR_QUALITY': 'Open burning of garden trimmings and biomass on vacant municipal plots causing dense particulate smoke dispersion over primary schools during morning assembly hours.',
};

const REALISTIC_PHOTOS: Record<string, string[]> = {
  'ROADS': [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
  ],
  'WATER': [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80',
  ],
  'WASTE': [
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
  ],
  'LIGHTING': [
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
  ],
  'PUBLIC_PROPERTY': [
    'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
  ],
  'AIR_QUALITY': [
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&auto=format&fit=crop&q=80',
  ],
};

function getSeedIssues(): Issue[] {
  const statuses: IssueStatus[] = ['VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'PENDING_VERIFICATION'];
  return PUDUCHERRY_AUTHENTIC_PINS.map((pin, i) => {
    const status = statuses[i % statuses.length];
    const cat = pin.category;
    const catPhotos = REALISTIC_PHOTOS[cat] || REALISTIC_PHOTOS.ROADS;
    const photo = catPhotos[i % catPhotos.length];
    
    return {
      id: `iss-pud-${100 + i}`,
      title: pin.title,
      description: REALISTIC_DESCRIPTIONS[cat] || `Critical municipal issue identified in ${pin.ward}, Puducherry requiring prompt departmental attention.`,
      category: pin.category,
      status: status,
      priority: pin.priority,
      priority_score: pin.priority_score,
      location: pin.location,
      ward: pin.ward,
      area_type: (i % 2 === 0 ? 'SCHOOL_HOSPITAL' : 'COMMERCIAL') as AreaType,
      hectic_level: (pin.priority === 'CRITICAL' ? 'EXTREMELY_BUSY' : 'BUSY') as HecticLevel,
      reporter_id: 'usr-citizen-01',
      reporter_name: i % 3 === 0 ? 'Anonymous Citizen' : (i % 2 === 0 ? 'Aravindhan Sundar' : 'Priya Ramanathan'),
      is_anonymous: i % 3 === 0,
      ai_category: pin.category,
      ai_confidence: 0.94 + ((i % 5) * 0.01),
      ai_classified_at: '2026-09-28T14:30:00Z',
      attachments: [photo],
      status_history: [
        {
          status: 'PENDING_VERIFICATION',
          changed_at: '2026-09-28T14:30:00Z',
          changed_by: 'usr-citizen-01',
          note: 'Report submitted via CiviTrack mobile app.',
        },
        ...(status !== 'PENDING_VERIFICATION' ? [
          {
            status: 'VERIFIED' as IssueStatus,
            changed_at: '2026-09-29T09:15:00Z',
            changed_by: 'usr-ngo-01',
            note: 'Verified in field by Clean Pondy Trust volunteer team.',
          }
        ] : []),
        ...(status === 'IN_PROGRESS' || status === 'RESOLVED' ? [
          {
            status: 'IN_PROGRESS' as IssueStatus,
            changed_at: '2026-09-30T11:00:00Z',
            changed_by: 'usr-auth-01',
            note: 'Work order dispatched to Puducherry Municipal Corporation field crew.',
          }
        ] : []),
        ...(status === 'RESOLVED' ? [
          {
            status: 'RESOLVED' as IssueStatus,
            changed_at: '2026-10-01T12:00:00Z',
            changed_by: 'usr-auth-01',
            note: 'Completed rectification verified by ward engineer.',
          }
        ] : [])
      ],
      like_count: pin.like_count,
      comment_count: 2 + (i % 4),
      share_count: 1 + (i % 3),
      resolved_at: status === 'RESOLVED' ? '2026-10-01T12:00:00Z' : null,
      citizen_verified_resolved: status === 'RESOLVED',
      created_at: new Date(Date.now() - (i * 3600000 * 12)).toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

// ─── Local Storage Helper Functions ───────────────────────────────────────────
function getStoredUsers(): Record<string, { user: User; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    const custom = raw ? JSON.parse(raw) : {};
    return { ...PREDEFINED_USERS, ...custom };
  } catch {
    return PREDEFINED_USERS;
  }
}

function saveUser(email: string, user: User, passwordHash: string) {
  try {
    const current = getStoredUsers();
    current[email.toLowerCase()] = { user, passwordHash };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(current));
  } catch (e) {
    console.warn('LocalStorage saveUser error', e);
  }
}

export function getStoredIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage getStoredIssues error', e);
  }
  const seed = getSeedIssues();
  saveIssues(seed);
  return seed;
}

function saveIssues(issues: Issue[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  } catch (e) {
    console.warn('LocalStorage saveIssues error', e);
  }
}

// ─── TF-IDF / Keyword AI Classifier ────────────────────────────────────────────
const AI_KEYWORDS: Record<IssueCategory, string[]> = {
  ROADS: ['road', 'pothole', 'crater', 'traffic', 'footpath', 'pavement', 'asphalt', 'divider', 'tar', 'highway', 'skid', 'accident', 'speedbreaker'],
  WATER: ['water', 'pipe', 'leak', 'drain', 'drainage', 'sewage', 'canal', 'flood', 'pump', 'waterlogging', 'drinking', 'contamination', 'borewell', 'tap'],
  WASTE: ['garbage', 'waste', 'trash', 'dump', 'dustbin', 'litter', 'plastic', 'smell', 'stench', 'compost', 'sanitation', 'debris', 'overflow'],
  LIGHTING: ['light', 'lamp', 'streetlight', 'dark', 'bulb', 'wire', 'pole', 'illumination', 'spark', 'luminaire', 'night', 'transformer'],
  AIR_QUALITY: ['air', 'smoke', 'dust', 'pollution', 'smog', 'haze', 'burning', 'fumes', 'emission', 'factory', 'cement'],
  PARKS: ['park', 'tree', 'garden', 'bench', 'grass', 'plant', 'playground', 'green', 'leaf', 'branches', 'botanical'],
  PUBLIC_PROPERTY: ['wall', 'railing', 'statue', 'monument', 'french', 'promenade', 'beach', 'heritage', 'bench', 'bus stop', 'shelter', 'toilet', 'board'],
  OTHER: ['grievance', 'issue', 'help', 'municipal', 'ward', 'assistance', 'problem']
};

export function classifyTextLocally(text: string): { category: IssueCategory; confidence: number } {
  const lower = text.toLowerCase();
  let bestCategory: IssueCategory = 'ROADS';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(AI_KEYWORDS) as [IssueCategory, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += kw.length > 5 ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  const confidence = bestScore > 0 
    ? Math.min(0.99, Number((0.85 + (bestScore * 0.03)).toFixed(3)))
    : 0.88;

  return { category: bestCategory, confidence };
}

// ─── Priority Matrix Calculator ───────────────────────────────────────────────
export function calculatePriorityScoreLocally(areaType: string, hecticLevel: string, imageSeverity = 0.5) {
  const AREA_WEIGHTS: Record<string, number> = {
    'SCHOOL_HOSPITAL': 30,
    'HIGHWAY': 26,
    'COMMERCIAL': 22,
    'INDUSTRIAL': 18,
    'RESIDENTIAL': 15,
    'RURAL': 10,
  };

  const HECTIC_WEIGHTS: Record<string, number> = {
    'EXTREMELY_BUSY': 30,
    'BUSY': 22,
    'MODERATE': 15,
    'LOW': 10,
    'VERY_LOW': 5,
  };

  const areaPts = AREA_WEIGHTS[areaType] || 15;
  const hecticPts = HECTIC_WEIGHTS[hecticLevel] || 15;
  const imagePts = Math.round(imageSeverity * 40);

  const totalScore = Math.min(100, Math.max(10, areaPts + hecticPts + imagePts));

  let priority: IssuePriority = 'LOW';
  if (totalScore >= 80) priority = 'CRITICAL';
  else if (totalScore >= 60) priority = 'HIGH';
  else if (totalScore >= 40) priority = 'MEDIUM';

  return {
    priority,
    priority_score: totalScore,
    breakdown: {
      location_pts: areaPts,
      traffic_pts: hecticPts,
      hazard_pts: imagePts,
    },
  };
}

// ─── Conversational AI (CiviBot) ───────────────────────────────────────────────
export function getChatbotResponse(message: string, lang = 'en'): { response: string; intent: string } {
  const m = message.toLowerCase();
  
  if (lang === 'ta') {
    if (m.includes('வணக்கம்') || m.includes('hello')) {
      return { response: 'வணக்கம்! நான் புதுச்சேரி குடிமை AI உதவியாளர் CiviBot. சாலை, கழிவுநீர், அல்லது குப்பை புகார் அளிக்க எனக்கு தகவல் தெரிவிக்கவும்.', intent: 'greeting' };
    }
    return { response: 'உங்கள் கேள்வி பதிவு செய்யப்பட்டது. எங்கள் புதுச்சேரி AI அமைப்பு அனைத்து வார்டுகளிலும் உடனுக்குடன் கண்காணித்து வருகிறது.', intent: 'general' };
  }

  if (lang === 'fr') {
    if (m.includes('bonjour') || m.includes('salut')) {
      return { response: 'Bonjour! Je suis CiviBot, l’assistant IA décisionnel pour Puducherry. Comment puis-je vous aider aujourd’hui?', intent: 'greeting' };
    }
    return { response: 'Votre signalement a été analysé par notre système de prédiction municipale.', intent: 'general' };
  }

  if (m.includes('priority') || m.includes('score')) {
    return {
      response: 'CiviTrack prioritizes issues using a 3-tier algorithm: 1) Proximity to vulnerable zones (Schools/Hospitals: +30 pts), 2) Traffic congestion level (Extremely busy: +30 pts), and 3) Deep-learning image hazard analysis (up to +40 pts). Scores 80+ trigger Critical municipal SLA!',
      intent: 'priority_info'
    };
  }
  if (m.includes('track') || m.includes('anonymous')) {
    return {
      response: 'You can report civic grievances completely anonymously without an account. Each report generates a secure 9-character cryptographic Tracking Token (e.g. TRK-PUD-94821) to follow live repair progress.',
      intent: 'track_info'
    };
  }
  if (m.includes('pothole') || m.includes('road')) {
    return {
      response: 'Road issues are automatically classified by our TF-IDF model and dispatched to the PWD Roads Sub-division. Critical potholes near school zones receive 24-hour SLA remediation.',
      intent: 'roads_info'
    };
  }

  return {
    response: 'Vanakkam! I am CiviBot, your Puducherry Urban Decision Assistant. I can help you register grievances, explain AI priority matrices, check ward SLA status, or track your anonymous token.',
    intent: 'general_faq'
  };
}

// ─── Main Mock Request Handler (Intercepts all Axios calls) ────────────────────
export function handleMockRequest(config: any): any | null {
  if (!config) return null;

  const url: string = config.url || '';
  const method: string = (config.method || 'get').toLowerCase();
  
  // Normalize path removing base /api prefix
  let path = url;
  if (path.startsWith('/api/')) path = path.replace('/api', '');
  else if (path.startsWith('/api')) path = path.replace('/api', '');
  if (!path.startsWith('/')) path = '/' + path;

  // 1. Auth: Login
  if (path === '/auth/login' && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const email = (body.email || '').trim().toLowerCase();
    const pwd = body.password || '';
    const users = getStoredUsers();

    const record = users[email];
    if (record) {
      if (record.passwordHash === pwd || pwd === 'citizen123' || pwd === 'ngo123' || pwd === 'authority123' || pwd.length >= 4) {
        return {
          access_token: `mock-jwt-token-${record.user.id}-${Date.now()}`,
          token_type: 'bearer',
          user: record.user,
        };
      }
    }

    // Dynamic auto-admit fallback for presentation stability
    const detectedRole = email.includes('authority') ? 'AUTHORITY' : email.includes('ngo') ? 'NGO' : 'CITIZEN';
    const fallbackUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: detectedRole,
      ward: 'Lawspet',
      language: 'en',
      eco_score: 100,
      level: 'REPORTER',
      streak: 3,
      achievements: ['WELCOME_BONUS'],
    };
    saveUser(email, fallbackUser, pwd);
    return {
      access_token: `mock-jwt-token-${fallbackUser.id}-${Date.now()}`,
      token_type: 'bearer',
      user: fallbackUser,
    };
  }

  // 2. Auth: Register
  if (path === '/auth/register' && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const email = (body.email || `citizen_${Date.now()}@civitrack.in`).trim().toLowerCase();
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: body.name || 'Puducherry Resident',
      email: email,
      role: body.role || 'CITIZEN',
      ward: body.ward || 'Lawspet',
      language: body.language || 'en',
      eco_score: 25,
      level: 'NEWCOMER',
      streak: 1,
      achievements: ['WELCOME_BONUS', 'CITIZEN_REGISTRATION'],
      created_at: new Date().toISOString(),
    };
    saveUser(email, newUser, body.password || 'password123');
    return {
      access_token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
      token_type: 'bearer',
      user: newUser,
    };
  }

  // 3. Auth: Current User (/auth/me)
  if (path === '/auth/me') {
    const users = getStoredUsers();
    return PREDEFINED_USERS['citizen@civitrack.in'].user;
  }

  // 4. ML Text Classification (/ml/classify-text)
  if (path.includes('/ml/classify-text') && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const text = body.text || '';
    return classifyTextLocally(text);
  }

  // 5. ML Priority Scoring (/ml/priority-score)
  if (path.includes('/ml/priority-score') && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    return calculatePriorityScoreLocally(body.area_type || 'SCHOOL_HOSPITAL', body.hectic_level || 'EXTREMELY_BUSY', body.image_severity || 0.5);
  }

  // 6. ML Chatbot (/ml/chatbot)
  if (path.includes('/ml/chatbot') && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    return getChatbotResponse(body.message || '', body.language || 'en');
  }

  // 7. ML Image Validation (/ml/validate-image)
  if (path.includes('/ml/validate-image') && method === 'post') {
    return {
      is_valid: true,
      hazard_score: 0.88,
      detected_hazard: 'Authentic municipal infrastructure wear / safety hazard verified',
      confidence: 0.94,
    };
  }

  // 8. Issues: Create (/issues)
  if (path === '/issues' && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const issues = getStoredIssues();
    const ai = classifyTextLocally(body.title + ' ' + body.description);
    const prio = calculatePriorityScoreLocally(body.area_type || 'SCHOOL_HOSPITAL', body.hectic_level || 'EXTREMELY_BUSY', 0.8);

    const newIssue: Issue = {
      id: `iss-pud-${Date.now().toString(36)}`,
      title: body.title,
      description: body.description,
      category: body.category || ai.category,
      status: 'PENDING_VERIFICATION',
      priority: prio.priority,
      priority_score: prio.priority_score,
      location: {
        type: 'Point',
        coordinates: [body.longitude || 79.8135, body.latitude || 11.9542],
      },
      ward: body.ward || 'Lawspet',
      area_type: body.area_type || 'SCHOOL_HOSPITAL',
      hectic_level: body.hectic_level || 'EXTREMELY_BUSY',
      reporter_id: body.is_anonymous ? null : 'usr-citizen-01',
      reporter_name: body.is_anonymous ? 'Anonymous Citizen' : 'Aravindhan Sundar',
      is_anonymous: !!body.is_anonymous,
      ai_category: ai.category,
      ai_confidence: ai.confidence,
      ai_classified_at: new Date().toISOString(),
      attachments: body.attachments && body.attachments.length > 0
        ? body.attachments
        : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
      status_history: [
        {
          status: 'PENDING_VERIFICATION',
          changed_at: new Date().toISOString(),
          changed_by: 'usr-citizen-01',
          note: 'Civic grievance officially registered through CiviTrack mobile/web portal.',
        },
      ],
      like_count: 1,
      comment_count: 0,
      share_count: 0,
      resolved_at: null,
      citizen_verified_resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    issues.unshift(newIssue);
    saveIssues(issues);

    return {
      ...newIssue,
      tracking_token: `TRK-PUD-${Math.floor(10000 + Math.random() * 90000)}`,
      ai_vision: {
        hazard_detected: true,
        confidence: 0.96,
        description: 'Verified civic defect with edge AI hazard validation',
      },
    };
  }

  // 9. Issues: Verify (/issues/:id/verify)
  if (path.includes('/issues/') && path.includes('/verify') && method === 'patch') {
    const issueId = path.split('/')[2];
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const issues = getStoredIssues();
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = body.action === 'reject' ? 'REJECTED' : 'VERIFIED';
      if (body.escalate_to_critical) {
        issue.priority = 'CRITICAL';
        issue.priority_score = 95;
      }
      issue.status_history.push({
        status: issue.status,
        changed_at: new Date().toISOString(),
        changed_by: 'usr-ngo-01',
        note: body.reason || (issue.status === 'VERIFIED' ? 'Verified on-site by Ward NGO Inspector.' : 'Rejected upon field inspection.'),
      });
      saveIssues(issues);
      return issue;
    }
  }

  // 10. Issues: Update Status (/issues/:id/status)
  if (path.includes('/issues/') && path.includes('/status') && method === 'patch') {
    const issueId = path.split('/')[2];
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const issues = getStoredIssues();
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = body.status as IssueStatus;
      if (issue.status === 'RESOLVED') {
        issue.resolved_at = new Date().toISOString();
      }
      issue.status_history.push({
        status: issue.status,
        changed_at: new Date().toISOString(),
        changed_by: 'usr-auth-01',
        note: body.note || `Status updated to ${issue.status} by Municipal Works Engineer.`,
      });
      saveIssues(issues);
      return issue;
    }
  }

  // 11. Issues: Citizen Verify Resolved (/issues/:id/citizen-verify)
  if (path.includes('/issues/') && path.includes('/citizen-verify') && method === 'patch') {
    const issueId = path.split('/')[2];
    const issues = getStoredIssues();
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      issue.citizen_verified_resolved = true;
      saveIssues(issues);
      return issue;
    }
  }

  // 12. Issues: Like (/issues/:id/like)
  if (path.includes('/issues/') && path.includes('/like') && method === 'post') {
    const issueId = path.split('/')[2];
    const issues = getStoredIssues();
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      issue.like_count += 1;
      saveIssues(issues);
      return { liked: true, like_count: issue.like_count };
    }
    return { liked: true, like_count: 42 };
  }

  // 13. Issues: Comments (/issues/:id/comments)
  if (path.includes('/issues/') && path.includes('/comments')) {
    if (method === 'post') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      const newComment: Comment = {
        id: `cmt-${Date.now()}`,
        issue_id: path.split('/')[2],
        user_id: 'usr-citizen-01',
        user_name: 'Aravindhan Sundar',
        user_role: 'CITIZEN',
        is_pinned: false,
        content: body.content || '',
        parent_id: body.parent_id || null,
        is_internal: !!body.is_internal,
        created_at: new Date().toISOString(),
      };
      return newComment;
    }
    return [
      {
        id: 'cmt-1',
        issue_id: path.split('/')[2],
        user_id: 'usr-ngo-01',
        user_name: 'Clean Pondy Trust NGO',
        user_role: 'NGO',
        is_pinned: true,
        is_internal: false,
        parent_id: null,
        content: 'Our field inspector surveyed the location this morning. Forwarding with urgent priority to Public Works Dept.',
        created_at: '2026-09-30T10:15:00Z',
      },
      {
        id: 'cmt-2',
        issue_id: path.split('/')[2],
        user_id: 'usr-auth-01',
        user_name: 'Puducherry Municipal Commissioner',
        user_role: 'AUTHORITY',
        is_pinned: false,
        is_internal: false,
        parent_id: null,
        content: 'Work order #PMC-2026-881 approved. Contractor scheduled for road/drain restoration within 48h.',
        created_at: '2026-10-01T08:30:00Z',
      },
    ];
  }

  // 14. Issues: Anonymous Tracking (/issues/track-anonymous)
  if (path.includes('/issues/track-anonymous')) {
    const issues = getStoredIssues();
    return issues[0] || getSeedIssues()[0];
  }

  // 15. Issues: Get By ID (/issues/:id)
  if (path.startsWith('/issues/') && method === 'get') {
    const issueId = path.split('/')[2];
    const issues = getStoredIssues();
    const found = issues.find((i) => i.id === issueId);
    return found || issues[0] || getSeedIssues()[0];
  }

  // 16. Issues: Get All (/issues)
  if (path === '/issues' && method === 'get') {
    let issues = getStoredIssues();
    const params = config.params || {};

    if (params.ward) {
      issues = issues.filter((i) => i.ward.toLowerCase() === String(params.ward).toLowerCase());
    }
    if (params.category) {
      issues = issues.filter((i) => i.category.toLowerCase() === String(params.category).toLowerCase());
    }
    if (params.status) {
      issues = issues.filter((i) => i.status.toLowerCase() === String(params.status).toLowerCase());
    }
    if (params.search) {
      const q = String(params.search).toLowerCase();
      issues = issues.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }

    return {
      issues,
      total: issues.length,
      page: 1,
      limit: 50,
    };
  }

  // 17. Map Pins (/map/pins)
  if (path === '/map/pins') {
    const issues = getStoredIssues();
    return issues.map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      priority: i.priority,
      priority_score: i.priority_score,
      status: i.status,
      location: i.location,
      ward: i.ward,
      like_count: i.like_count,
    }));
  }

  // 18. Map Heatmap (/map/heatmap)
  if (path === '/map/heatmap') {
    const issues = getStoredIssues();
    return issues.map((i) => ({
      lat: i.location.coordinates[1],
      lng: i.location.coordinates[0],
      intensity: i.priority_score / 100,
    }));
  }

  // 19. Map Wards (/map/wards or /wards)
  if (path === '/map/wards' || path === '/wards') {
    return [
      { name: 'White Town', code: 'W01', councillor: 'M. Sivaraj', issue_count: 6 },
      { name: 'Lawspet', code: 'W02', councillor: 'V. Sundaram', issue_count: 8 },
      { name: 'Muthialpet', code: 'W03', councillor: 'K. Balaji', issue_count: 5 },
      { name: 'Villianur', code: 'W04', councillor: 'P. Anand', issue_count: 4 },
      { name: 'Ariyankuppam', code: 'W05', councillor: 'R. Loganathan', issue_count: 3 },
      { name: 'Bahour', code: 'W06', councillor: 'S. Velmurugan', issue_count: 3 },
      { name: 'Mudaliarpet', code: 'W07', councillor: 'N. Subramanian', issue_count: 3 },
      { name: 'Nellithope', code: 'W08', councillor: 'J. Murugan', issue_count: 2 },
      { name: 'Embalam', code: 'W09', councillor: 'T. Arumugam', issue_count: 2 },
    ];
  }

  // 20. NGO Dashboard (/ngo/pending, /ngo/stats)
  if (path === '/ngo/pending') {
    const issues = getStoredIssues();
    return issues.filter((i) => i.status === 'PENDING_VERIFICATION');
  }
  if (path === '/ngo/stats') {
    const issues = getStoredIssues();
    return {
      pending: issues.filter((i) => i.status === 'PENDING_VERIFICATION').length,
      verified_today: 9,
      total_resolved: issues.filter((i) => i.status === 'RESOLVED').length,
      avg_verification_time_hours: 1.8,
    };
  }

  // 21. Analytics
  if (path === '/analytics/summary') {
    const issues = getStoredIssues();
    const resolved = issues.filter((i) => i.status === 'RESOLVED').length;
    return {
      total: issues.length,
      pending: issues.filter((i) => i.status === 'PENDING_VERIFICATION').length,
      verified: issues.filter((i) => i.status === 'VERIFIED').length,
      in_progress: issues.filter((i) => i.status === 'IN_PROGRESS').length,
      resolved: resolved,
      critical: issues.filter((i) => i.priority === 'CRITICAL').length,
      resolution_rate: Number(((resolved / (issues.length || 1)) * 100).toFixed(1)),
      avg_resolution_days: 2.3,
    };
  }

  if (path === '/analytics/monthly') {
    return [
      { month: 'Apr', year: 2026, total: 18, resolved: 14 },
      { month: 'May', year: 2026, total: 22, resolved: 18 },
      { month: 'Jun', year: 2026, total: 29, resolved: 24 },
      { month: 'Jul', year: 2026, total: 31, resolved: 27 },
      { month: 'Aug', year: 2026, total: 26, resolved: 22 },
      { month: 'Sep', year: 2026, total: 25, resolved: 21 },
    ];
  }

  if (path === '/analytics/category') {
    const issues = getStoredIssues();
    const counts: Record<string, number> = {};
    issues.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  }

  if (path === '/analytics/wards') {
    const issues = getStoredIssues();
    const wards = ['White Town', 'Lawspet', 'Muthialpet', 'Villianur', 'Ariyankuppam', 'Bahour', 'Mudaliarpet', 'Nellithope', 'Embalam'];
    return wards.map((w) => {
      const wardIssues = issues.filter((i) => i.ward === w);
      const res = wardIssues.filter((i) => i.status === 'RESOLVED').length;
      return {
        ward: w,
        total: wardIssues.length || 2,
        resolved: res || 1,
        critical: wardIssues.filter((i) => i.priority === 'CRITICAL').length,
        resolution_rate: Math.round(((res || 1) / (wardIssues.length || 2)) * 100),
      };
    });
  }

  if (path === '/analytics/sla') {
    const issues = getStoredIssues();
    const slaLimits: Record<string, number> = { LOW: 14, MEDIUM: 7, HIGH: 3, CRITICAL: 1 };
    return issues.slice(0, 15).map((i) => {
      const limit = slaLimits[i.priority] || 7;
      const ageDays = Number(((Date.now() - new Date(i.created_at).getTime()) / (1000 * 3600 * 24)).toFixed(1));
      return {
        _id: i.id,
        title: i.title,
        category: i.category,
        ward: i.ward,
        priority: i.priority || 'MEDIUM',
        status: i.status || 'VERIFIED',
        created_at: i.created_at,
        age_days: Math.max(0.4, ageDays),
        sla_days: limit,
        sla_breached: i.status !== 'RESOLVED' && ageDays > limit,
      };
    });
  }

  if (path === '/analytics/preventative-insights') {
    return {
      generated_at: new Date().toISOString(),
      total_analyzed_issues: 25,
      projected_overall_reduction: '71.4%',
      projected_annual_savings: '₹1.45 Crores',
      primary_preventive_objective: 'Transition Puducherry Municipal Administration from Reactive Complaint Fixing to Predictive Pre-Emptive Maintenance.',
      category_insights: [
        {
          category: 'ROADS',
          root_causes: [
            'Monsoon stormwater sub-base layer saturation on Airport Road and Rue Dumas',
            'Utility trenching backfilled without standardized mechanical compaction',
          ],
          preventative_actions: [
            'Polymer-modified cold-asphalt crack sealing before peak monsoon',
            'Enforce municipal Right-of-Way unified utility trenching duct corridors',
          ],
          recurrence_risk: 'CRITICAL',
          recurrence_probability: '82%',
          tech_solution: 'Automated weekly road-defect scanning via edge-AI camera modules.',
          cost_benefit_ratio: '₹1 invested in preventive sub-base sealing saves ₹6.40 in emergency road repairs.',
        },
        {
          category: 'WATER',
          root_causes: [
            'Groundwater saline corrosion degrading pipe couplings in coastal White Town',
            'Siltation in historic tank feeder canals across Bahour and Villianur',
          ],
          preventative_actions: [
            'Acoustic pressure monitoring on trunk distribution lines',
            'Desilt and restore sluice gate regulator mechanisms across Bahour canals',
          ],
          recurrence_risk: 'HIGH',
          recurrence_probability: '68%',
          tech_solution: 'IoT ultrasonic water-flow sensors for real-time anomaly detection.',
          cost_benefit_ratio: '₹1 invested saves ₹5.20 in emergency water tanker deployments.',
        },
      ],
      high_priority_interventions: [
        {
          category: 'ROADS',
          tier: '30-Day Immediate Win',
          action: 'Polymer cold-asphalt crack sealing along Lawspet Airport Road corridor',
          impact_score: 94,
          projected_reduction: '74% reduction in recurring potholes',
          urgency: 'HIGH',
        },
        {
          category: 'WATER',
          tier: '90-Day Structural Hardening',
          action: 'Desilt Bahour and Villianur feeder canals and restore sluice regulators',
          impact_score: 88,
          projected_reduction: '78% reduction in agricultural waterlogging',
          urgency: 'HIGH',
        },
      ],
    };
  }

  // 22. Stories (/stories)
  if (path === '/stories') {
    return [
      {
        id: 'sty-1',
        author: { name: 'Aravindhan Sundar', ward: 'Lawspet' },
        media_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
        caption: 'Airport Road resurfacing underway! 🚜',
        created_at: new Date().toISOString(),
      },
      {
        id: 'sty-2',
        author: { name: 'Clean Pondy Trust', ward: 'White Town' },
        media_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
        caption: 'Stormwater canal desilted on Rue Suffren! 🌊',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ];
  }

  // 23. Leaderboard (/leaderboard)
  if (path === '/leaderboard') {
    return [
      { rank: 1, name: 'Aravindhan Sundar', ward: 'Lawspet', eco_score: 185, resolved_count: 9, level: 'GUARDIAN' },
      { rank: 2, name: 'Priya Ramanathan', ward: 'White Town', eco_score: 160, resolved_count: 7, level: 'REPORTER' },
      { rank: 3, name: 'Karthik Subramanian', ward: 'Muthialpet', eco_score: 145, resolved_count: 6, level: 'REPORTER' },
      { rank: 4, name: 'Selvi Anbazhagan', ward: 'Villianur', eco_score: 120, resolved_count: 5, level: 'OBSERVER' },
    ];
  }

  // 24. Notifications (/notifications)
  if (path === '/notifications') {
    return [
      {
        id: 'notif-1',
        title: 'Report Verified! 🎉',
        message: 'Your report regarding Airport Road Potholes was verified by Clean Pondy Trust.',
        created_at: '10m ago',
        is_read: false,
      },
      {
        id: 'notif-2',
        title: 'Work Order Dispatched 🚜',
        message: 'Municipal Works Department dispatched a repair crew to Lawspet.',
        created_at: '2h ago',
        is_read: false,
      },
    ];
  }

  return null;
}
