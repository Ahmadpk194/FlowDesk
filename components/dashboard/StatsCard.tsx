type StatsCardProps = {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
};

export default function StatsCard({ label, value, color = "text-[#0d1c2e]", icon }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-4">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {icon && <div className={`${color} opacity-70`}>{icon}</div>}
      </div>
    </div>
  );
}