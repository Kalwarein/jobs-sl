import StatusBadge from '@/components/StatusBadge';
import { mockApplications } from '@/data/mockData';
import { ChevronRight } from 'lucide-react';

const ApplicationsPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-title mb-1">My Applications</h1>
        <p className="text-caption text-muted-foreground">{mockApplications.length} applications</p>
      </div>

      <div className="px-4 space-y-3">
        {mockApplications.map((app) => (
          <button
            key={app.id}
            className="w-full text-left rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-body-lg font-semibold truncate">{app.jobTitle}</h3>
              <p className="text-caption text-muted-foreground">{app.company}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={app.status} />
                <span className="text-tiny text-muted-foreground">• {app.appliedAt}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsPage;
