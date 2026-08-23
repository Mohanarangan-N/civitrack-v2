import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend } from 'recharts'
import { CATEGORY_EMOJI } from '../types'

const COLORS = ['#E85038','#3B9ED4','#E8901A','#FFD060','#B57BFF','#4CC88A','#7EC8E3','#8BAF9A']

export default function AnalyticsPage() {
  const { data: summary } = useQuery({ queryKey:['summary'], queryFn:()=>analyticsAPI.summary().then(r=>r.data) })
  const { data: monthly=[] } = useQuery({ queryKey:['monthly'], queryFn:()=>analyticsAPI.monthly().then(r=>r.data) })
  const { data: cats=[] } = useQuery({ queryKey:['categories'], queryFn:()=>analyticsAPI.categories().then(r=>r.data) })
  const { data: wardsData=[] } = useQuery({ queryKey:['wards-stats'], queryFn:()=>analyticsAPI.wards().then(r=>r.data) })

  const KPIs = summary ? [
    {label:'Total Issues',value:summary.total_issues,color:'#3B9ED4'},
    {label:'Open Issues',value:summary.open_issues,color:'#E8901A'},
    {label:'Critical',value:summary.critical_issues,color:'#E85038'},
    {label:'Resolved',value:summary.resolved_issues,color:'#4CC88A'},
    {label:'Pending NGO',value:summary.pending_verification,color:'#B57BFF'},
    {label:'Total Users',value:summary.total_users,color:'#22A66A'},
  ] : []

  const catWithEmoji = cats.map((c:any)=>({...c,name:`${CATEGORY_EMOJI[c.category as any]||'📌'} ${c.category}`}))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-semibold text-[#E8F5EE] mb-5">📊 Analytics Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {KPIs.map(k=>(
          <div key={k.label} className="bg-[#111E17] border border-[#1E3028] rounded-xl p-4">
            <div className="text-2xl font-bold" style={{color:k.color}}>{k.value}</div>
            <div className="text-xs text-[#8BAF9A] mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Monthly trend */}
        <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-5">
          <div className="text-sm font-medium text-[#E8F5EE] mb-4">Monthly Issues</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{fill:'#8BAF9A',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#8BAF9A',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#162219',border:'1px solid #1E3028',borderRadius:8,color:'#E8F5EE',fontSize:11}}/>
              <Bar dataKey="count" fill="#22A66A" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-5">
          <div className="text-sm font-medium text-[#E8F5EE] mb-4">By Category</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={catWithEmoji} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                {catWithEmoji.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'#162219',border:'1px solid #1E3028',borderRadius:8,color:'#E8F5EE',fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ward health */}
        <div className="bg-[#111E17] border border-[#1E3028] rounded-2xl p-5 col-span-2">
          <div className="text-sm font-medium text-[#E8F5EE] mb-4">Ward Health Scores</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={wardsData} layout="vertical">
              <XAxis type="number" tick={{fill:'#8BAF9A',fontSize:10}} domain={[0,100]} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="ward" tick={{fill:'#8BAF9A',fontSize:10}} width={90} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#162219',border:'1px solid #1E3028',borderRadius:8,color:'#E8F5EE',fontSize:11}}/>
              <Bar dataKey="health_score" fill="#22A66A" radius={[0,4,4,0]}>
                {wardsData.map((_:any,i:number)=><Cell key={i} fill={i<3?'#E85038':i<6?'#E8901A':'#22A66A'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
