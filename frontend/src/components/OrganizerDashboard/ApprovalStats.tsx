import { Users, Clock, CheckCircle, XCircle, ListOrdered, type LucideIcon } from 'lucide-react';
import type { ApprovalStats as Stats } from '@/hooks/useApprovalRequests';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: 'gray' | 'amber' | 'green' | 'blue' | 'red';
}

const StatCard = ({ label, value, icon: Icon, color = 'gray' }: StatCardProps) => {
  const colorClasses = {
    gray: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

interface ApprovalStatsProps {
  stats: Stats;
}

export function ApprovalStats({ stats }: ApprovalStatsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <StatCard label="Total" value={stats.total} icon={Users} />
      <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
      <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="green" />
      <StatCard label="Waitlisted" value={stats.waitlisted} icon={ListOrdered} color="blue" />
      <StatCard label="Declined" value={stats.rejected} icon={XCircle} color="red" />
    </div>
  );
}

export { StatCard };
export type { StatCardProps };
