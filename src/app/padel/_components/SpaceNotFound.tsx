import { BackArrow } from "@/components/BackArrow/BackArrow";

/** A space that doesn't exist, or that the user can't see */
export const SpaceNotFound = () => (
  <div className="max-w-3xl w-full mx-auto px-6 py-10 space-y-4">
    <BackArrow href="/padel" label="All spaces" />
    <p className="text-muted-foreground">
      Space not found. Ask the owner to make you a host, or to link your name to
      your account.
    </p>
  </div>
);
