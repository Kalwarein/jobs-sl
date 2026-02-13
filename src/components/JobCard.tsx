import { MapPin, Clock, BadgeCheck, Bookmark, Share2 } from 'lucide-react';
import { Job } from '@/types';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: Job;
  onTap?: () => void;
}

const JobCard = ({ job, onTap }: JobCardProps) => {
  return (
    <button
      onClick={onTap}
      className="w-full text-left rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-subtitle truncate">{job.title}</h3>
            {job.isFeatured && (
              <Badge className="bg-primary/10 text-primary border-0 text-tiny shrink-0">
                Featured
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-body text-muted-foreground">
            <span className="font-medium">{job.company}</span>
            {job.isVerified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground"
          >
            <Bookmark className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {job.postedAt}
        </span>
        <Badge variant="secondary" className="text-tiny">
          {job.type}
        </Badge>
      </div>

      {job.salary && (
        <p className="mt-2 text-body font-semibold text-primary">{job.salary}</p>
      )}
    </button>
  );
};

export default JobCard;
