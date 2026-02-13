import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, BadgeCheck, Bookmark, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockJobs } from '@/data/mockData';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = mockJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-display mb-2">😕</p>
        <p className="text-subtitle">Job not found</p>
        <Button onClick={() => navigate('/jobs')} className="mt-4">Back to Jobs</Button>
      </div>
    );
  }

  const handleWhatsAppShare = () => {
    const text = `Check out this job: ${job.title} at ${job.company} - ${job.location}. Apply on Job Giver SL!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-subtitle flex-1 truncate">Job Details</h1>
        <button className="p-2 rounded-full hover:bg-muted">
          <Bookmark className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 py-5">
        {/* Title area */}
        <div className="mb-5">
          {job.isFeatured && (
            <Badge className="bg-primary/10 text-primary border-0 text-tiny mb-2">Featured</Badge>
          )}
          <h2 className="text-display">{job.title}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-body-lg text-muted-foreground">
            <span className="font-medium">{job.company}</span>
            {job.isVerified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-caption text-muted-foreground mb-5">
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
            <MapPin className="h-4 w-4" /> {job.location}
          </span>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" /> {job.postedAt}
          </span>
          <Badge variant="secondary" className="text-caption">{job.type}</Badge>
        </div>

        {job.salary && (
          <div className="bg-accent rounded-xl p-4 mb-5">
            <p className="text-caption text-muted-foreground">Salary</p>
            <p className="text-subtitle text-primary">{job.salary}</p>
          </div>
        )}

        {job.deadline && (
          <p className="text-caption text-destructive font-medium mb-5">
            ⏰ Application Deadline: {job.deadline}
          </p>
        )}

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-subtitle mb-2">Description</h3>
          <p className="text-body text-muted-foreground leading-relaxed">{job.description}</p>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <h3 className="text-subtitle mb-2">Requirements</h3>
          <ul className="space-y-2">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-body text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-4 py-3 flex gap-3 z-40">
        <Button
          onClick={handleWhatsAppShare}
          variant="outline"
          className="h-12 rounded-xl flex-shrink-0"
        >
          <Share2 className="h-5 w-5 mr-1.5" /> Share
        </Button>
        <Button className="h-12 rounded-xl flex-1 text-body-lg font-semibold">
          Apply Now
        </Button>
      </div>
    </div>
  );
};

export default JobDetailPage;
