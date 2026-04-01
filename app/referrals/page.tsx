'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { Share2, Award, Coins, Loader2, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, limit, getCountFromServer, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, any> = {
  share: Share2,
  award: Award,
  coins: Coins,
};

export default function ReferralsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState([
    { title: 'Total Active Codes', value: '...', icon: 'share', color: 'indigo' },
    { title: 'Successful Referrals', value: '...', icon: 'award', color: 'emerald' },
    { title: 'Network Tracing', value: 'Live Data', icon: 'coins', color: 'amber' },
  ]);
  
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      try {
        // 1. Fetch High Level Aggregations via Cloud Functions API (No read quotas)
        const codesCountSnap = await getCountFromServer(collection(db, 'referralCodes'));
        const referredUsersQuery = query(collection(db, 'users'), where('referredBy', '!=', null));
        const referredCountSnap = await getCountFromServer(referredUsersQuery);

        if (mounted) {
          setStats([
            { title: 'Generated Custom Codes', value: codesCountSnap.data().count.toString(), icon: 'share', color: 'indigo' },
            { title: 'Total Invited Users', value: referredCountSnap.data().count.toString(), icon: 'award', color: 'emerald' },
            { title: 'Database Relational Mapping', value: 'Live Active', icon: 'coins', color: 'amber' },
          ]);
        }

        // 2. Fetch Latest 100 Users Chronologically (To bypass missing generic Composite Index rules)
        const recentUsersQuery = query(
          collection(db, 'users'), 
          orderBy('joinedAt', 'desc'),
          limit(100)
        );
        const usersSnap = await getDocs(recentUsersQuery);

        // Filter out non-referrals and limit to latest 15
        const referredOnly = usersSnap.docs.filter(d => {
           const val = d.data().referredBy;
           return val && val !== null && val.trim() !== '';
        }).slice(0, 15);

        const feedData: any[] = [];

        // 3. Resolve the Inviter for each user using "Client-Side NoSQL Joins"
        for (const userDoc of referredOnly) {
           const userData = userDoc.data();
           const inviterCode = userData.referredBy; // e.g., 'JAVE3994'
           
           let inviterUid = 'Unknown Origin';
           
           if (inviterCode) {
              // Lookup exact mapping in referralCodes collection
              const codeRef = doc(db, 'referralCodes', inviterCode);
              const codeSnap = await getDoc(codeRef);
              
              if (codeSnap.exists()) {
                 inviterUid = codeSnap.data().uid || 'System Admin';
              }
           }

           feedData.push({
             id: userDoc.id,
             invitedUid: userDoc.id,
             invitedName: userData.displayName || userData.name || userData.email || 'Unknown User',
             inviterCode: inviterCode,
             inviterUid: inviterUid,
             date: userData.joinedAt 
                    ? new Date(userData.joinedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                    : 'N/A'
           });
        }
        
        if (mounted) {
           setRecentReferrals(feedData);
           setLoading(false);
        }

      } catch (error) {
        console.error("Failed fetching referrals:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchAllData();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referral Analytics Ledger</h1>
        <p className="text-slate-500">Trace invitation branches naturally through organic Firebase relational NoSQL queries.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={iconMap[stat.icon]}
            color={stat.color as any}
          />
        ))}
      </div>

      <div className="space-y-6">
           <DataTable
             isLoading={loading}
             title="Recent Referral Origin Mapping"
             data={recentReferrals}
             onRowClick={(item) => router.push(`/users/${item.invitedUid}`)}
             columns={[
               { header: 'Inviter (Origin UID)', accessor: (item) => (
                   <span 
                     onClick={(e) => {
                        e.stopPropagation();
                        // Allows instant tapping of the Parent Inviter directly to their core profile
                        if(item.inviterUid !== 'Unknown Origin') {
                           router.push(`/users/${item.inviterUid}`);
                        }
                     }}
                     className="font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors px-2 py-1 bg-indigo-50 rounded-lg inline-block"
                   >
                     {item.inviterUid.length > 15 ? `${item.inviterUid.substring(0,8)}...` : item.inviterUid}
                   </span>
               )},
               { header: 'Matching Code', accessor: (item) => (
                   <div className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded inline-flex items-center gap-1">
                     <Share2 size={12} className="text-slate-400" />
                     {item.inviterCode}
                   </div>
               )},
               { header: 'Connected Link', accessor: () => (
                   <ArrowRight size={14} className="text-slate-300" />
               )},
               { header: 'Invited User (Destination)', accessor: (item) => (
                  <div className="flex flex-col">
                     <span className="font-semibold text-slate-900">{item.invitedName}</span>
                     <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">{item.invitedUid}</span>
                  </div>
               )},
               { header: 'Connection Date', accessor: 'date' },
             ]}
           />
      </div>
    </div>
  );
}
