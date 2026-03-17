'use client';

import React from 'react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { referralStats, referralTracking } from '@/lib/mock-data';
import { Share2, Award, Coins } from 'lucide-react';

const iconMap: Record<string, any> = {
  share: Share2,
  award: Award,
  coins: Coins,
};

export default function ReferralsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referral Analytics</h1>
        <p className="text-slate-500">Track referral performance and reward distribution.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {referralStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={iconMap[stat.icon]}
            color={stat.color as any}
          />
        ))}
      </div>

      <DataTable
        title="Referral Tracking"
        data={referralTracking}
        columns={[
          { header: 'Inviter User', accessor: 'inviter', className: 'font-medium text-slate-900' },
          { header: 'Invited User', accessor: 'invited' },
          { header: 'Reward Coins', accessor: (item) => (
            <span className="font-semibold text-emerald-600">+{item.reward}</span>
          )},
          { header: 'Date', accessor: 'date' },
        ]}
      />
    </div>
  );
}
