import { Users } from "lucide-react";

export const NotShared = () => (
  <div className="max-w-md mx-auto px-6 py-24 text-center space-y-3">
    <div className="w-11 h-11 mx-auto rounded-xl bg-muted flex items-center justify-center">
      <Users className="w-5 h-5 text-muted-foreground" />
    </div>
    <h1 className="text-xl font-semibold">These players aren&apos;t shared</h1>
    <p className="text-sm text-muted-foreground">
      The link may have been turned off. Ask the person keeping score for a new
      one.
    </p>
  </div>
);
