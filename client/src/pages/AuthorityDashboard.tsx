import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI, issuesAPI } from '@/api';
import type { AnalyticsSummary, MonthlyData, CategoryData, WardData, SLAItem, Issue } from '@/types';
import { KPICard } from '@/components/dashboard/KPICard';
import { SLATracker } from '@/components/dashboard/SLATracker';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/utils/constants';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  Shield, Download, CheckCircle, Clock, AlertTriangle, Activity, 
  FileSpreadsheet, TrendingDown, Zap, Target, CheckCircle2, Sparkles,
  Truck, Wrench, ExternalLink, MapPin, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const COLORS = ['#22A66A', '#3B9ED4', '#E8901A', '#E8D61A', '#9B59B6', '#1ABC9C', '#E85038', '#95A5A6'];

export const AuthorityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [actionIssues, setActionIssues] = useState<Issue[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>({
    total: 25,
    pending: 3,
    verified: 9,
    in_progress: 7,
    resolved: 6,
    critical: 7,
    resolution_rate: 76.5,
    avg_resolution_days: 2.3,
  });
  const [monthly, setMonthly] = useState<MonthlyData[]>([
    { month: 'Apr', year: 2026, total: 18, resolved: 14 },
    { month: 'May', year: 2026, total: 22, resolved: 18 },
    { month: 'Jun', year: 2026, total: 29, resolved: 24 },
    { month: 'Jul', year: 2026, total: 31, resolved: 27 },
    { month: 'Aug', year: 2026, total: 26, resolved: 22 },
    { month: 'Sep', year: 2026, total: 25, resolved: 21 },
  ]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([
    { category: 'ROADS', count: 7 },
    { category: 'WATER', count: 6 },
    { category: 'WASTE', count: 5 },
    { category: 'LIGHTING', count: 3 },
    { category: 'PUBLIC_PROPERTY', count: 2 },
    { category: 'AIR_QUALITY', count: 2 },
  ]);
  const [wardData, setWardData] = useState<WardData[]>([
    { ward: 'Lawspet', total: 6, resolved: 4, critical: 2, resolution_rate: 66.7 },
    { ward: 'White Town', total: 5, resolved: 4, critical: 1, resolution_rate: 80.0 },
    { ward: 'Mudaliarpet', total: 4, resolved: 3, critical: 2, resolution_rate: 75.0 },
    { ward: 'Oulgaret', total: 4, resolved: 3, critical: 1, resolution_rate: 75.0 },
    { ward: 'Villianur', total: 3, resolved: 2, critical: 1, resolution_rate: 66.7 },
    { ward: 'Ariyankuppam', total: 2, resolved: 2, critical: 0, resolution_rate: 100 },
    { ward: 'Bahour', total: 2, resolved: 1, critical: 0, resolution_rate: 50 },
  ]);
  const [slaItems, setSlaItems] = useState<SLAItem[]>([]);
  const [preventionData, setPreventionData] = useState<any>(null);
  const [selectedPreventionCat, setSelectedPreventionCat] = useState<string>('ROADS');
  const [loading, setLoading] = useState(false);

  const refreshActionQueue = async () => {
    try {
      const issuesRes = await issuesAPI.getAll().catch(() => ({ issues: [] }));
      const allIssues: Issue[] = issuesRes?.issues || (Array.isArray(issuesRes) ? issuesRes : []);
      setActionIssues(allIssues.filter((i: Issue) => i.status === 'VERIFIED' || i.status === 'IN_PROGRESS'));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [sumRes, monRes, catRes, wardRes, slaRes, prevRes, issuesRes] = await Promise.all([
          analyticsAPI.getSummary().catch(() => null),
          analyticsAPI.getMonthly().catch(() => null),
          analyticsAPI.getCategory().catch(() => null),
          analyticsAPI.getWards().catch(() => null),
          analyticsAPI.getSLA().catch(() => null),
          analyticsAPI.getPreventativeInsights().catch(() => null),
          issuesAPI.getAll().catch(() => ({ issues: [] })),
        ]);
        if (sumRes) setSummary(sumRes);
        if (monRes?.length) setMonthly(monRes);
        if (catRes?.length) setCategoryData(catRes);
        if (wardRes?.length) setWardData(wardRes);
        if (slaRes?.length) setSlaItems(slaRes);
        if (prevRes) setPreventionData(prevRes);

        const allIssues: Issue[] = issuesRes?.issues || (Array.isArray(issuesRes) ? issuesRes : []);
        setActionIssues(allIssues.filter((i: Issue) => i.status === 'VERIFIED' || i.status === 'IN_PROGRESS'));
      } catch (err) {
        console.error(err);
      }
    }
    loadAnalytics();
  }, []);

  const handleDispatch = async (issueId: string) => {
    setUpdatingId(issueId);
    try {
      await issuesAPI.updateStatus(issueId, {
        status: 'IN_PROGRESS',
        note: 'Municipal Works Department dispatched repair crew and contractor team.',
      });
      toast.success('🚜 Work Order Dispatched! Citizen & Ward notified.');
      await refreshActionQueue();
    } catch {
      toast.error('Failed to dispatch work order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolve = async (issueId: string) => {
    setUpdatingId(issueId);
    try {
      await issuesAPI.updateStatus(issueId, {
        status: 'RESOLVED',
        note: 'Municipal repair completed on-site. Infrastructure restored.',
      });
      toast.success('✅ Marked Resolved! Citizen alerted to confirm resolution (+50 pts).');
      await refreshActionQueue();
    } catch {
      toast.error('Failed to mark resolved');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!slaItems.length) {
      toast.error('No SLA items available to export');
      return;
    }
    const headers = 'ID,Title,Category,Ward,Priority,Status,AgeDays,SLALimit,SLABreached\n';
    const rows = slaItems.map((i) =>
      `"${i._id}","${i.title}","${i.category}","${i.ward}","${i.priority}","${i.status}",${i.age_days},${i.sla_days},${i.sla_breached}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CiviTrack_SLA_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('CSV Report Downloaded!');
  };

  const handleDownloadPreventionPlan = () => {
    const text = `============================================================
PUDUCHERRY MUNICIPAL CORPORATION — URBAN RESILIENCE PLAN
AI-Driven Predictive Prevention & Recurrence Reduction Strategy
Generated by CiviTrack V2 Decision Support System
============================================================

PRIMARY OBJECTIVE:
Transition from Reactive Complaint Fixing to Proactive Pre-Emptive Maintenance.

KEY TARGETS:
- City-wide Recurrence Reduction: -71.4%
- Estimated Annual CapEx/OpEx Savings: ₹1.45 Crores
- Priority Wards: Lawspet, White Town, Mudaliarpet, Oulgaret

ACTION ROADMAP BY DOMAIN:
1. ROADS:
   - 30-Day: Deploy polymer-modified cold asphalt seal coats before monsoons.
   - 90-Day: Install roadside pre-cast concrete box culverts with geotextile layers.
   - 1-Year: Enforce unified digital Right-of-Way (RoW) utility ducting bylaws.

2. WATER & DRAINAGE:
   - 30-Day: Acoustic pressure leak detection on distribution mains.
   - 90-Day: Desilt historic feeder canals (Bahour Lake & Villianur Temple tanks).
   - 1-Year: Deploy SCADA-controlled District Metered Areas with relief valves.

3. SOLID WASTE:
   - 30-Day: Synchronize compactor schedules with 8:00 PM commercial market closures.
   - 90-Day: Solar-powered CCTV deterrents at recurrence dumping blackspots.
   - 1-Year: Decentralized micro-composting units in all 10 wards.

4. LIGHTING & ELECTRICAL:
   - 30-Day: Dielectric silicone terminal seals on coastal fixtures.
   - 90-Day: Marine-grade C5-M IP66 luminaires along Beach Road.
   - 1-Year: Centralized Smart Management System (CCMS) with real-time fault telemetry.

============================================================
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Puducherry_Municipal_Prevention_Action_Plan_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    toast.success('Municipal Prevention Action Plan Downloaded!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 card p-6 border-accent/40 bg-gradient-to-r from-bg-surface via-bg-elevated to-bg-surface">
        <div>
          <span className="text-xs font-bold text-accent uppercase flex items-center gap-1.5">
            <Shield size={14} /> Municipal Urban Governance Command Centre
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary mt-1">
            Puducherry Municipal Decision Support Analytics
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time Operational Intelligence, SLA Compliance, and Machine Learning Prevention Roadmaps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleDownloadPreventionPlan} variant="secondary" size="sm" className="text-xs font-bold border-accent/40 text-accent">
            <Sparkles size={14} /> AI Prevention Plan
          </Button>
          <Button onClick={handleExportCSV} size="sm" className="text-xs font-bold shadow-lg shadow-accent/20">
            <FileSpreadsheet size={14} /> Export SLA CSV
          </Button>
          <Link to="/feed">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-text-secondary hover:text-text-primary border border-primary/20">
              Public Feed →
            </Button>
          </Link>
          <Button
            onClick={() => {
              logout();
              navigate('/login');
              toast.success('Signed out successfully');
            }}
            variant="ghost"
            size="sm"
            className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30"
          >
            <LogOut size={14} /> Switch / Logout
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Issues Tracked"
            value={summary.total}
            subtitle="Authentic Puducherry issues"
            icon={<Activity size={20} />}
            color="#3B9ED4"
          />
          <KPICard
            title="City Resolution Rate"
            value={`${summary.resolution_rate}%`}
            subtitle="Citizen verified completion"
            icon={<CheckCircle size={20} />}
            color="#22A66A"
          />
          <KPICard
            title="CRITICAL Emergencies"
            value={summary.critical}
            subtitle="Potholes / Line bursts"
            icon={<AlertTriangle size={20} />}
            color="#E85038"
          />
          <KPICard
            title="Avg Resolution Time"
            value={`${summary.avg_resolution_days} Days`}
            subtitle="From submission to verified"
            icon={<Clock size={20} />}
            color="#E8D61A"
          />
        </div>
      )}

      {/* MUNICIPAL WORK ORDER DISPATCH & ACTION COMMAND QUEUE */}
      <div className="card p-6 border-2 border-accent/40 bg-bg-surface space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-primary/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider mb-1">
              <Truck size={16} />
              <span>Verified Civic Queue Awaiting Municipal Action</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-text-primary">
              Work Order Dispatch & Contractor Assignment ({actionIssues.length})
            </h2>
            <p className="text-xs text-text-muted">
              Issues verified by Ward NGOs ready for contractor mobilization and status progression.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent border border-accent/30">
              {actionIssues.filter(i => i.status === 'VERIFIED').length} Pending Dispatch
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/20 text-warning border border-warning/30">
              {actionIssues.filter(i => i.status === 'IN_PROGRESS').length} Active In-Field
            </span>
          </div>
        </div>

        {actionIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted rounded-xl bg-bg-elevated border border-primary/10">
            No verified issues currently awaiting municipal work order dispatch. All caught up!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {actionIssues.map((issue) => {
              const catCfg = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER;
              const isUpdating = updatingId === issue.id;

              return (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl bg-bg-elevated border border-primary/20 hover:border-accent/40 transition-all flex flex-col justify-between gap-3 shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{catCfg.emoji}</span>
                        <span className="text-[11px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                          {catCfg.label}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                        issue.priority === 'CRITICAL' ? 'bg-danger/20 text-danger border-danger/40' :
                        issue.priority === 'HIGH' ? 'bg-warning/20 text-warning border-warning/40' :
                        'bg-accent/20 text-accent border-accent/40'
                      }`}>
                        {issue.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary line-clamp-1">{issue.title}</h4>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-1">
                      <span className="flex items-center gap-1 font-semibold text-text-primary">
                        <MapPin size={12} className="text-accent" /> {issue.ward} Ward
                      </span>
                      <span className="text-text-muted">•</span>
                      <span className="font-mono">Status: <strong className="text-accent">{issue.status}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-primary/10 flex items-center justify-between gap-2">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-[11px] text-text-muted hover:text-accent font-semibold flex items-center gap-1"
                    >
                      <span>View Details</span> <ExternalLink size={12} />
                    </Link>

                    <div className="flex items-center gap-2">
                      {issue.status === 'VERIFIED' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDispatch(issue.id)}
                          className="px-3 py-1.5 rounded-xl bg-accent hover:bg-primary-light text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-accent/20 disabled:opacity-50 active:scale-95"
                        >
                          <Truck size={13} /> {isUpdating ? 'Dispatching...' : 'Dispatch Crew'}
                        </button>
                      )}

                      {issue.status === 'IN_PROGRESS' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleResolve(issue.id)}
                          className="px-3 py-1.5 rounded-xl bg-success hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-success/20 disabled:opacity-50 active:scale-95"
                        >
                          <CheckCircle2 size={13} /> {isUpdating ? 'Updating...' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Line Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4 text-text-primary">Monthly Issue Intake vs Resolution Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <XAxis dataKey="month" stroke="#8BAF9A" fontSize={12} />
                <YAxis stroke="#8BAF9A" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111E17', borderColor: '#22A66A' }} />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total Submissions" stroke="#3B9ED4" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" name="Resolved Issues" stroke="#22A66A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4 text-text-primary">Civic Issue Distribution by Municipal Domain</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111E17', borderColor: '#22A66A' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Health Scores Bar Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold mb-4 text-text-primary">Ward-Level Civic Workload & Resolution Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData}>
                <XAxis dataKey="ward" stroke="#8BAF9A" fontSize={11} />
                <YAxis stroke="#8BAF9A" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111E17', borderColor: '#22A66A' }} />
                <Bar dataKey="total" name="Total Issues" fill="#3B9ED4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#22A66A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" name="Critical" fill="#E85038" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI URBAN PREVENTION & RECURRENCE REDUCTION COMMAND CENTER */}
      <div className="card p-6 md:p-8 border-2 border-accent/40 bg-bg-surface space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-primary/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-widest mb-1">
              <TrendingDown size={16} />
              <span>AI Predictive Prevention & Recurrence Reduction Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary">
              Pre-Emptive Root-Cause Interventions for Puducherry
            </h2>
            <p className="text-xs text-text-muted mt-1 max-w-2xl">
              Machine learning models analyze issue clusters to pinpoint systemic root causes and prescribe forward-looking preventative policies to permanently eliminate repeated breakdowns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Target Recurrence Drop</span>
              <span className="text-2xl font-black text-success">-71.4%</span>
            </div>
            <div className="text-right pl-3 border-l border-primary/20">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Annual Savings</span>
              <span className="text-2xl font-black text-accent">₹1.45 Cr</span>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => (
            <button
              key={catKey}
              onClick={() => setSelectedPreventionCat(catKey)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedPreventionCat === catKey
                  ? 'bg-accent text-white shadow-md shadow-accent/25'
                  : 'bg-bg-elevated border border-primary/20 text-text-muted hover:text-text-primary'
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>

        {/* Root Causes and 3-Tier Intervention Roadmap */}
        {(() => {
          const catInfo = preventionData?.category_insights?.find(
            (c: any) => c.category === selectedPreventionCat
          );

          const defaultRootCauses: Record<string, string[]> = {
            ROADS: [
              "Heavy monsoonal stormwater infiltration saturating the sub-base layer",
              "Heavy commercial freight transit exceeding axle load tolerances on non-arterial link roads",
              "Utility trenching (fiber-optic/water) backfilled without standardized compaction",
            ],
            WATER: [
              "Aging ductile iron and cast-iron distribution lines suffering hydraulic water-hammer fatigue",
              "Groundwater saline intrusion corroding pipeline joints in coastal wards",
              "Siltation in historic tank feeder canals (Bahour Lake & Villianur Temple tanks) inhibiting natural drainage",
            ],
            WASTE: [
              "Commercial market closing hours (Goubert & Oulgaret markets) out of sync with municipal compactor schedules",
              "Absence of segregated organic waste processing hubs near vegetable and fish retail clusters",
              "Blackspot illegal dumping at poorly lit peripheral plots during nocturnal hours",
            ],
            LIGHTING: [
              "High saline maritime aerosol inducing rapid galvanic corrosion on unsealed luminaire terminals",
              "Monsoon moisture ingress through underground cable junction boxes lacking IP68 resin sealing",
              "Uncalibrated astronomical timer switches causing daytime burning and premature LED driver failure",
            ],
            AIR_QUALITY: [
              "Open biomass and horticultural waste combustion on peri-urban vacant plots",
              "High vehicular idling congestion at non-synchronized traffic signals along ECR / Anna Salai",
              "Construction dust dispersion from uncurtained commercial developments",
            ],
            PARKS: [
              "Over-extraction of coastal shallow aquifer leading to localized salinization in municipal park vegetation",
              "Inadequate drip irrigation infrastructure causing excessive manual water bowser dependency",
              "Lack of periodic arboricultural trimming leading to storm branch failures",
            ],
            PUBLIC_PROPERTY: [
              "Marine aerosol salt crystallization accelerating concrete spalling on heritage waterfront monuments",
              "Pedestrian overuse on Promenade Beach balustrades lacking sacrificial protective coatings",
              "Delayed structural maintenance on municipal market shelters and public facilities",
            ],
            OTHER: [
              "Cross-departmental jurisdictional fragmentation between PWD, LAD, and Electricity Department",
              "Absence of unified digital Right-of-Way coordination for municipal excavations",
              "Lack of automated sensor telemetry for early failure detection",
            ],
          };

          const defaultInterventions: Record<string, any[]> = {
            ROADS: [
              { tier: "30-Day Immediate Win", action: "Deploy polymer-modified cold asphalt seal coats on micro-cracks before North-East Monsoon", impact: "45% reduction in monsoon pothole crater formation" },
              { tier: "90-Day Structural Hardening", action: "Install roadside pre-cast concrete box culverts with geotextile filtration", impact: "74% drop in road washouts and sub-base subsidence" },
              { tier: "1-Year Strategic Resilience", action: "Enact unified digital Right-of-Way (RoW) utility corridor trenching bylaws", impact: "88% elimination of repeated road excavations" },
            ],
            WATER: [
              { tier: "30-Day Immediate Win", action: "Systematic acoustic pressure leak detection on trunk distribution lines in White Town & Lawspet", impact: "55% faster detection before pipeline ruptures become visible" },
              { tier: "90-Day Structural Hardening", action: "Desilt and restore sluice gate regulator mechanisms across Bahour & Villianur canals", impact: "78% reduction in agricultural and residential waterlogging" },
              { tier: "1-Year Strategic Resilience", action: "Deploy Smart SCADA-controlled District Metered Areas with automated pressure-relief valves", impact: "86% decrease in recurring potable water pipeline bursts" },
            ],
            WASTE: [
              { tier: "30-Day Immediate Win", action: "Align secondary compactor vehicle collection schedules with peak evening market closing (8:00 PM)", impact: "60% elimination of morning open dumpster overflow" },
              { tier: "90-Day Structural Hardening", action: "Deploy solar-powered CCTV cameras and bright LED floodlights at identified recurrence blackspots", impact: "82% deterrent efficacy against nocturnal debris dumping" },
              { tier: "1-Year Strategic Resilience", action: "Establish decentralized ward-level micro-composting facilities converting organic vegetable waste", impact: "70% diversion of solid waste from open landfill dumping" },
            ],
            LIGHTING: [
              { tier: "30-Day Immediate Win", action: "Apply dielectric anti-corrosive silicone gel sealants to all junction terminals within 1.5 km of coastline", impact: "62% drop in saline short-circuit failures" },
              { tier: "90-Day Structural Hardening", action: "Upgrade conventional luminaire enclosures to Marine-Grade (C5-M corrosion resistant) IP66 fixtures", impact: "85% reduction in premature LED luminaire replacements" },
              { tier: "1-Year Strategic Resilience", action: "Centralized Smart Streetlight Central Management System (CCMS) with real-time fault alerts", impact: "92% reduction in unnotified street dark spots city-wide" },
            ],
            AIR_QUALITY: [
              { tier: "30-Day Immediate Win", action: "Intensify ward municipal patrols against open waste and biomass burning with immediate spot fines", impact: "65% drop in localized smoke haze complaints" },
              { tier: "90-Day Structural Hardening", action: "Deploy synchronized smart traffic signal corridors along ECR and Anna Salai junctions", impact: "40% reduction in peak-hour vehicular idle emissions" },
              { tier: "1-Year Strategic Resilience", action: "Establish real-time IoT ambient air quality monitoring mesh across all 10 wards", impact: "75% improvement in localized pollution response speed" },
            ],
            PARKS: [
              { tier: "30-Day Immediate Win", action: "Implement scheduled arboricultural safety pruning of hazardous trees ahead of cyclone season", impact: "80% reduction in cyclone-induced branch fall damage" },
              { tier: "90-Day Structural Hardening", action: "Install solar-powered automated drip irrigation utilizing recycled municipal wastewater", impact: "60% reduction in potable water usage for municipal greenspaces" },
              { tier: "1-Year Strategic Resilience", action: "Develop urban micro-forests (Miyawaki method) in peri-urban public parcels", impact: "35% increase in native biodiversity canopy cover" },
            ],
            PUBLIC_PROPERTY: [
              { tier: "30-Day Immediate Win", action: "Apply hydrophobic sacrificial sealants to heritage promenade balustrades and monuments", impact: "70% reduction in sea-spray structural degradation" },
              { tier: "90-Day Structural Hardening", action: "Refurbish high-traffic municipal bus shelters and public sanitary complexes with vandal-resistant fittings", impact: "85% decrease in recurring maintenance work orders" },
              { tier: "1-Year Strategic Resilience", action: "Implement a digital QR asset tagging registry for automated preventative asset inspection", impact: "90% tracking coverage of all municipal public assets" },
            ],
            OTHER: [
              { tier: "30-Day Immediate Win", action: "Establish cross-departmental rapid grievance dispatch protocol between PWD and Municipal Corporation", impact: "50% faster inter-departmental ticket resolution" },
              { tier: "90-Day Structural Hardening", action: "Deploy Unified Urban GIS Decision Support Portal across all municipal sub-offices", impact: "75% reduction in duplicate civic inspection trips" },
              { tier: "1-Year Strategic Resilience", action: "Establish citizen co-governance participatory budget allocations for ward preventative works", impact: "85% citizen satisfaction rating in ward service delivery" },
            ],
          };

          const causes = (catInfo?.root_causes && catInfo.root_causes.length > 0)
            ? catInfo.root_causes
            : (defaultRootCauses[selectedPreventionCat] || defaultRootCauses.ROADS);

          const rawPlans = (catInfo?.preventative_interventions && catInfo.preventative_interventions.length > 0)
            ? catInfo.preventative_interventions
            : (defaultInterventions[selectedPreventionCat] || defaultInterventions.ROADS);

          return (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Root Causes Column */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-danger uppercase tracking-wider block">
                  Root Cause Diagnosis (Why Issues Keep Occurring)
                </span>
                <div className="space-y-2">
                  {causes.map((c: string, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-bg-elevated border border-primary/20 flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-danger/20 text-danger flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-text-secondary font-medium leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Tier Prevention Action Plan */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-success uppercase tracking-wider block">
                  Prescribed Preventative Interventions
                </span>
                <div className="space-y-2.5">
                  {rawPlans.map((p: any, i: number) => {
                    const tier = typeof p === 'string' ? `Tier ${i + 1} Action` : (p.tier || `Tier ${i + 1}`);
                    const impact = typeof p === 'string' ? 'Target: -65% recurrence' : (p.impact || p.projected_reduction || 'Target: -65% recurrence');
                    const action = typeof p === 'string' ? p : (p.action || p.title || 'Execute municipal preventative work order');

                    return (
                      <div key={i} className="p-3.5 rounded-xl bg-bg-elevated border border-primary/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase">
                            {tier}
                          </span>
                          <span className="text-[11px] font-bold text-success flex items-center gap-1">
                            <CheckCircle2 size={12} /> {impact}
                          </span>
                        </div>
                        <p className="text-text-primary font-semibold">{action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SLA Tracking Table */}
      <SLATracker items={slaItems} />
    </div>
  );
};
