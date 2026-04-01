'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Coins, 
  Activity, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { SkeletonCard, SkeletonBlock } from '@/components/Skeleton';
import { useUI } from '@/context/UIContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { collection, query, where, orderBy, limit, getCountFromServer, getAggregateFromServer, sum, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, any> = {
  users: Users,
  coins: Coins,
  activity: Activity,
  wallet: Wallet,
};

export default function DashboardPage() {
  const { addNotification } = useUI();
  const router = useRouter();

  // Dashboard state
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '...', icon: 'users', color: 'indigo', trend: { value: '0%', isUp: true } },
    { title: 'Coins Distributed', value: '...', icon: 'coins', color: 'emerald', trend: { value: 'Live', isUp: true } },
    { title: 'Total Transactions', value: '...', icon: 'activity', color: 'amber', trend: { value: 'Live', isUp: true } },
    { title: 'Pending Withdraws', value: '...', icon: 'wallet', color: 'rose', trend: { value: '0%', isUp: false } },
  ]);

  const [recentWithdraws, setRecentWithdraws] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Fetch High-Level Counts (1-Read Aggregate APIs)
    const fetchCounts = async () => {
      try {
        const usersCountSnap = await getCountFromServer(collection(db, 'users'));
        const txCountSnap = await getCountFromServer(collection(db, 'transactions'));
        
        const pendingWithdrawalsQuery = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
        const pendingCountSnap = await getCountFromServer(pendingWithdrawalsQuery);

        const coinsQuery = query(collection(db, 'transactions'), where('amount', '>', 0));
        const coinsAggregate = await getAggregateFromServer(coinsQuery, {
            totalCoins: sum('amount')
        });

        if (mounted) {
          setStats([
            { title: 'Total Users', value: usersCountSnap.data().count.toString(), icon: 'users', color: 'indigo', trend: { value: 'Live', isUp: true } },
            { title: 'Coins Distributed', value: coinsAggregate.data().totalCoins.toLocaleString(), icon: 'coins', color: 'emerald', trend: { value: 'Global', isUp: true } },
            { title: 'Total Transactions', value: txCountSnap.data().count.toString(), icon: 'activity', color: 'amber', trend: { value: 'Global', isUp: true } },
            { title: 'Pending Withdraws', value: pendingCountSnap.data().count.toString(), icon: 'wallet', color: 'rose', trend: { value: 'Needs Action', isUp: false } },
          ]);
        }
      } catch (e) {
        console.error("Failed fetching counts:", e);
      }
    };
    fetchCounts();

    // 2. Fetch 7-Day Chart Data efficiently
    const fetchChartData = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0,0,0,0);
        
        const q = query(
           collection(db, 'transactions'), 
           where('date', '>=', sevenDaysAgo.toISOString())
        );
        const snap = await getDocs(q);
        
        // Instantiate empty 7-day buckets
        const daysMap = new Map();
        for (let i = 6; i >= 0; i--) {
           const d = new Date();
           d.setDate(d.getDate() - i);
           const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
           daysMap.set(dayStr, { name: dayStr, coins: 0, events: 0 });
        }
        
        snap.forEach(doc => {
           const data = doc.data();
           const rxDate = new Date(data.date);
           const dayStr = rxDate.toLocaleDateString('en-US', { weekday: 'short' });
           
           if (daysMap.has(dayStr)) {
               const dayObj = daysMap.get(dayStr);
               dayObj.events += 1;
               if (data.amount > 0) {
                 dayObj.coins += data.amount;
               }
           }
        });
        
        if (mounted) {
           setChartData(Array.from(daysMap.values()));
           setChartsLoading(false);
        }
      } catch(e) { 
        console.error("Failed charting:", e);
        if (mounted) setChartsLoading(false);
      }
    };
    fetchChartData();

    // 3. Fetch Recent Withdrawals (Realtime)
    const withdrawsQ = query(collection(db, 'withdrawals'), orderBy('date', 'desc'), limit(5));
    const unsubWithdraws = onSnapshot(withdrawsQ, (snapshot) => {
      const wData: any[] = [];
      snapshot.forEach(doc => {
        const item = doc.data();
        wData.push({
          id: doc.id,
          user: item.uid || 'Unknown',
          amount: `₹${item.amount}`,
          status: item.status === 'completed' ? 'Approved' : item.status === 'failed' ? 'Rejected' : 'Pending',
          date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A'
        });
      });
      if (mounted) setRecentWithdraws(wData);
    });

    // 4. Fetch Recent Transactions (Realtime replacements for Mock Referrals)
    const txQ = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(5));
    const unsubTx = onSnapshot(txQ, (snapshot) => {
      const txData: any[] = [];
      snapshot.forEach(doc => {
        const item = doc.data();
        txData.push({
          id: doc.id,
          uid: item.uid ? item.uid.substring(0,8) + '...' : 'System',
          type: item.type || 'Activity',
          amount: item.amount > 0 ? `+${item.amount}` : item.amount,
          amountValue: item.amount || 0,
          date: item.date ? new Date(item.date).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'}) : 'N/A'
        });
      });
      if (mounted) setRecentTransactions(txData);
    });

    return () => {
      mounted = false;
      unsubWithdraws();
      unsubTx();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, here&apos;s what&apos;s happening with SmartEarn Admin today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {chartsLoading ? (
           Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
           stats.map((stat, idx) => (
             <StatCard
               key={idx}
               title={stat.title}
               value={stat.value}
               icon={iconMap[stat.icon]}
               trend={stat.trend}
               color={stat.color as any}
             />
           ))
        )}
      </div>

      {/* Live 7-Day Visual Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Events Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Platform Activity (Last 7 Days)</h3>
          </div>
          <div className="h-[200px] w-full">
            {chartsLoading ? (
               <div className="h-full flex items-center justify-center animate-pulse rounded-xl bg-slate-50"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                       <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                   />
                   <Area type="monotone" dataKey="events" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                 </AreaChart>
               </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Coins Disbursed Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Coins Distributed (Last 7 Days)</h3>
          </div>
          <div className="h-[200px] w-full">
             {chartsLoading ? (
               <div className="h-full flex items-center justify-center animate-pulse rounded-xl bg-slate-50"><Loader2 className="animate-spin text-slate-300" /></div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    />
                    <Bar dataKey="coins" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataTable
          title="Live Activity Stream (Transactions)"
          data={recentTransactions}
          isLoading={chartsLoading}
          columns={[
            { header: 'UID Hash', accessor: 'uid', className: 'text-xs text-slate-400 font-mono' },
            { header: 'Event', accessor: 'type', className: 'font-semibold text-slate-700' },
            { header: 'Coins', accessor: (item) => (
               <span className={item.amountValue > 0 ? 'text-emerald-600 font-bold' : 'text-slate-600 font-bold'}>{item.amount}</span>
            )},
            { header: 'Time', accessor: 'date' },
          ]}
        />

        <DataTable
          title="Recent Withdraw Requests"
          data={recentWithdraws}
          isLoading={chartsLoading}
          onRowClick={(item) => router.push(`/withdraw-requests/${item.id}`)}
          columns={[
            { header: 'User UID', accessor: 'user', className: 'truncate max-w-[120px]' },
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
