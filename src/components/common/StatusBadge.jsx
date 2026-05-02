import { getStatusColor, getStatusLabel } from '../../utils/formatters';

export default function StatusBadge({ status, size = 'sm' }) {
  const colorClasses = getStatusColor(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const dotColor = {
    draft: 'bg-gray-400',
    computed: 'bg-blue-400',
    validated: 'bg-amber-400',
    paid: 'bg-green-400',
    cancelled: 'bg-red-400',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-lg tracking-wide uppercase
        ${colorClasses}
        ${sizeClasses[size] || sizeClasses.sm}
      `.trim()}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${dotColor[status] || dotColor.draft}`} />
      {label}
    </span>
  );
}
