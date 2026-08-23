import React, { useState, useEffect } from 'react';
import { analyticsAPI, issuesAPI } from '@/api';
import type { AnalyticsSummary, MonthlyData, CategoryData, WardData, SLAItem } from '@/types';
import { KPICard } from '@/components/dashboard/KPICard';
import { SLATracker } from '@/components/dashboard/SLATracker';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Shield, Download, CheckCircle, Clock, AlertTriangle, Activity, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const COLORS = ['#22A66A', '#3B9ED4', '#E8901A', '#E8D61A', '#9B59B6', '#1ABC9C', '#E85038', '#95A5A6'];

export const AuthorityDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [wardData, setWardData] = useState<WardData[]>([]);
  const [slaItems, setSlaItems] = useState<SLAItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [sumRes, monRes, catRes, wardRes, slaRes] = await Promise.all([
          analyticsAPI.getSummary(),
          analyticsAPI.getMonthly(),
          analyticsAPI.getCategory(),
          analyticsAPI.getWards(),
          analyticsAPI.getSLA(),
        ]);
        setSummary(sumRes);
        setMonthly(monRes || []);
        setCategoryData(catRes || []);
        setWardData(wardRes || []);
        setSlaItems(slaRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!slaItems.length) return;
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

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-text-muted">Loading Municipal Decision Support Analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 card p-6 border-accent/40">
        <div>
          <span className="text-xs font-bold text-accent uppercase flex items-center gap-1">
            <Shield size={14} /> Municipal Urban Governance Command Centre
          </span>
          <h1 className="text-3xl font-black text-text-primary mt-0.5">
            Puducherry Municipal Analytics
          </h1>
          <p className="text-xs text-text-muted">
            Real-time Operational Intelligence, SLA Breach Tracking, & Resource Allocation
          </p>
        </div>

        <Button onClick={handleExportCSV} className="shadow-lg shadow-accent/20">
          <FileSpreadsheet size={16} /> Export CSV Report
        </Button>
      </div>

      {/* KPI Cards Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Issues Tracked"
            value={summary.total}
            subtitle="City-wide submissions"
            icon={<Activity size={20} />}
            color="#3B9ED4"
          />
          <KPICard
            title="City Resolution Rate"
            value={`${summary.resolution_rate}%`}
            subtitle="Citizen verified rate"
            icon={<CheckCircle size={20} />}
            color="#22A66A"
          />
          <KPICard
            title="CRITICAL Issues"
            value={summary.critical}
            subtitle="Requires immediate response"
            icon={<AlertTriangle size={20} />}
            color="#E85038"
          />
          <KPICard
            title="Avg Resolution Time"
            value={`${summary.avg_resolution_days} Days`}
            subtitle="From report to completion"
            icon={<Clock size={20} />}
            color="#E8D61A"
          />
        </div>
      )}

      {/* Recharts Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Line Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4 text-text-primary">Monthly Issue vs Resolution Trend</h3>
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
          <h3 className="text-sm font-bold mb-4 text-text-primary">Issue Distribution by Domain Category</h3>
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
          <h3 className="text-sm font-bold mb-4 text-text-primary">Ward-Level Issue Load & Resolution Health</h3>
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

      {/* SLA Tracking Table */}
      <SLATracker items={slaItems} />
    </div>
  );
};
