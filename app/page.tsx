'use client';

import React from 'react';
import { 
  Users, 
  Coins, 
  Share2, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { dashboardStats, recentReferrals, recentWithdraws, chartData } from '@/lib/mock-data';
import { useUI } from '@/context/UIContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const iconMap: Record<string, any> = {
  users: Users,
  coins: Coins,
  share: Share2,
  wallet: Wallet,
};

export default function DashboardPage() {
  const { addNotification } = useUI();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, here&apos;s what&apos;s happening with Smart Earn today.</p>
        </div>
        <button 
          onClick={() => addNotification({
            title: 'New Withdrawal Request',
            message: 'A new withdrawal request has been received.',
            type: 'withdrawal',
            link: '/withdraw-requests/1'
          })}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
        >
          Simulate Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={iconMap[stat.icon]}
            trend={stat.trend}
            color={stat.color as any}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">User Growth</h3>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Coins Distributed</h3>
            <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="coins" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataTable
          title="Recent Referrals"
          data={recentReferrals}
          columns={[
            { header: 'Inviter', accessor: 'inviter' },
            { header: 'Invited', accessor: 'invited' },
            { header: 'Reward', accessor: 'reward', className: 'font-medium text-emerald-600' },
            { header: 'Date', accessor: 'date' },
          ]}
        />

        <DataTable
          title="Recent Withdraw Requests"
          data={recentWithdraws}
          columns={[
            { header: 'User', accessor: 'user' },
            { header: 'Amount', accessor: 'amount', className: 'font-bold' },
            { header: 'Status', accessor: (item) => (
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                item.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                'bg-rose-50 text-rose-600'
              }`}>
                {item.status}
              </span>
            )},
            { header: 'Date', accessor: 'date' },
          ]}
        />
      </div>
    </div>
  );
}
