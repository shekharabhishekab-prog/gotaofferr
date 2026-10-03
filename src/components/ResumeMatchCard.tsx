/**
 * Hero visual: a dark resume preview card showing a 92% match score,
 * keyword tags and a "Cover letter ready" badge. Desktop-only replacement
 * for the animated WorkingGirl illustration.
 */

const SKILLS = ["React", "SQL", "Figma", "AWS"];

export function ResumeMatchCard() {
  return (
    <div className="relative mx-auto hidden w-full max-w-lg select-none lg:block">
      {/* ambient glow */}
      <div
        className="absolute -inset-10 -z-10 rounded-full bg-highlight/10 blur-3xl"
        aria-hidden
      />

      {/* match score badge */}
      <div className="absolute -left-5 -top-5 z-20 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lift backdrop-blur">
        <div className="font-display text-4xl font-bold text-highlight">92%</div>
        <div className="text-xs font-medium text-muted-foreground">Match score</div>
      </div>

      {/* main card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 p-6 shadow-lift backdrop-blur">
        {/* inner resume sheet */}
        <div className="relative space-y-4 rounded-2xl border border-border bg-background/70 p-6">
          {/* yellow accent bar */}
          <div className="h-4 w-2/5 rounded-full bg-highlight" />
          {/* gray meta line */}
          <div className="h-3 w-1/3 rounded-full bg-muted" />

          {/* body lines */}
          <div className="space-y-3 pt-2">
            <div className="h-2.5 w-full rounded-full bg-muted/60" />
            <div className="h-2.5 w-[92%] rounded-full bg-muted/60" />
            <div className="h-2.5 w-[78%] rounded-full bg-muted/60" />
            <div className="h-2.5 w-[85%] rounded-full bg-muted/60" />
            <div className="h-2.5 w-[64%] rounded-full bg-muted/60" />
          </div>

          {/* skill tags */}
          <div className="flex flex-wrap gap-2 pt-3">
            {SKILLS.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* cover letter ready pill */}
      <div className="absolute -bottom-4 right-2 z-20 whitespace-nowrap rounded-full border border-highlight/30 bg-highlight px-4 py-2.5 shadow-lift">
        <span className="text-sm font-semibold text-highlight-foreground">Cover letter ready</span>
      </div>


      {/* floating sparkle dots */}
      <span
        className="absolute top-1/4 -left-8 h-1.5 w-1.5 rounded-full bg-highlight/80"
        aria-hidden
      />
      <span
        className="absolute bottom-1/3 -right-6 h-2 w-2 rounded-full bg-highlight/60"
        aria-hidden
      />
      <span
        className="absolute -top-2 right-1/4 h-1 w-1 rounded-full bg-foreground/50"
        aria-hidden
      />
    </div>
  );
}

export default ResumeMatchCard;
