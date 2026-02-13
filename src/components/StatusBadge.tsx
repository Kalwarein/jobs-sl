import { Application } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: Application['status'];
}

const statusConfig: Record<Application['status'], { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-info/15 text-info border-0' },
  viewed: { label: 'Viewed', className: 'bg-warning/15 text-warning border-0' },
  shortlisted: { label: 'Shortlisted', className: 'bg-success/15 text-success border-0' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-0' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <Badge className={`${config.className} text-tiny font-semibold`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
