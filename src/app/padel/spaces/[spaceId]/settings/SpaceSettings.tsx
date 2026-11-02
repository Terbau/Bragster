"use client";

import { padelPlayerKey } from "@/utils/padelStats";
import { padelRoleLabel } from "@/app/padel/_components/padelRoles";
import {
  type PickedUser,
  UserPicker,
} from "@/app/padel/_components/UserPicker";
import {
  addPadelSpaceHost,
  deletePadelSpace,
  leavePadelSpace,
  linkPadelPlayer,
  type PadelSpaceDetails,
  removePadelSpaceHost,
  renamePadelSpace,
  unlinkPadelPlayer,
} from "@/app/padel/actions";
import { SpaceNameDialog } from "@/app/padel/SpaceNameDialog";
import { Avatar } from "@/components/Avatar/Avatar";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Link2, LogOut, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const SpaceSettings = ({
  space: serverSpace,
  currentUserId,
}: {
  space: PadelSpaceDetails;
  currentUserId: string;
}) => {
  const router = useRouter();
  const [space, setSpace] = useState(serverSpace);
  const [dialog, setDialog] = useState<"rename" | "delete" | "leave" | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [linkName, setLinkName] = useState("");
  const isOwner = space.role === "OWNER";

  useEffect(() => setSpace(serverSpace), [serverSpace]);

  const run = (
    action: () => Promise<PadelSpaceDetails>,
    successMessage: string,
  ) =>
    startTransition(async () => {
      try {
        setSpace(await action());
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  const addHost = (user: PickedUser) =>
    run(
      () => addPadelSpaceHost(space.id, user.id),
      `${user.email} can now host games`,
    );

  const linkPlayer = (user: PickedUser) =>
    run(
      () => linkPadelPlayer(space.id, { name: linkName, userId: user.id }),
      `${linkName} is linked to ${user.email}`,
    );

  const linkedKeys = space.links.map((link) => link.key);
  const unlinked = space.players.filter(
    (name) => !linkedKeys.includes(padelPlayerKey(name)),
  );

  const removeSpace = () =>
    startTransition(async () => {
      try {
        if (dialog === "delete") {
          await deletePadelSpace(space.id);
        } else {
          await leavePadelSpace(space.id);
        }
        router.push("/padel");
        router.refresh();
      } catch (error) {
        toast.error(errorMessage(error));
      }
    });

  return (
    <div className="space-y-10">
      <Section title="Space">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium break-words">{space.name}</p>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog("rename")}
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Rename
            </Button>
          )}
        </div>
      </Section>

      <Section
        title="Hosts"
        description="Hosts can create games, keep score and share links. Only the owner can change who hosts."
      >
        <ul className="rounded-xl border border-border bg-card divide-y divide-border">
          <UserRow
            user={space.owner}
            isYou={space.owner.id === currentUserId}
            badge={padelRoleLabel("OWNER")}
          />
          {space.hosts.map((host) => (
            <UserRow
              key={host.id}
              user={host}
              isYou={host.id === currentUserId}
              badge={padelRoleLabel("HOST")}
              onRemove={
                isOwner
                  ? () =>
                      run(
                        () => removePadelSpaceHost(space.id, host.id),
                        `${host.email} no longer hosts games`,
                      )
                  : undefined
              }
              disabled={isPending}
            />
          ))}
        </ul>
        {isOwner && (
          <div className="space-y-2">
            <label htmlFor="add-host" className="text-sm font-semibold">
              Add a host
            </label>
            <UserPicker
              id="add-host"
              excludeIds={space.hosts.map((host) => host.id)}
              disabled={isPending}
              onPick={addHost}
            />
          </div>
        )}
      </Section>

      <Section
        title="Players with an account"
        description="Players are just names, so nobody needs an account to play. A name linked to an account lets that person follow the games and ratings here, and marks them as you in the players list."
      >
        {space.links.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No names are linked yet.
          </p>
        ) : (
          <ul className="rounded-xl border border-border bg-card divide-y divide-border">
            {space.links.map((link) => (
              <UserRow
                key={link.key}
                user={link.user}
                isYou={link.user.id === currentUserId}
                title={link.name}
                onRemove={
                  isOwner
                    ? () =>
                        run(
                          () => unlinkPadelPlayer(space.id, link.key),
                          `${link.name} is no longer linked`,
                        )
                    : undefined
                }
                removeLabel={`Unlink ${link.name}`}
                disabled={isPending}
              />
            ))}
          </ul>
        )}
        {isOwner &&
          (space.players.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Names can be linked once they have played a game here.
            </p>
          ) : (
            <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Link2 className="w-4 h-4" />
                Link a name to an account
              </p>
              <select
                aria-label="Player"
                className={selectClass}
                value={linkName}
                disabled={isPending}
                onChange={(event) => setLinkName(event.target.value)}
              >
                <option value="">Choose a player</option>
                {unlinked.length > 0 && (
                  <optgroup label="Not linked">
                    {unlinked.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {space.links.length > 0 && (
                  <optgroup label="Linked, to change">
                    {space.links.map((link) => (
                      <option key={link.key} value={link.name}>
                        {link.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {linkName && (
                <UserPicker
                  disabled={isPending}
                  onPick={(user) => {
                    linkPlayer(user);
                    setLinkName("");
                  }}
                />
              )}
            </div>
          ))}
      </Section>

      <Section title={isOwner ? "Delete space" : "Leave space"}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Deletes the space with all its games, players and ratings."
              : "You stop hosting, and your name is no longer linked to your account. The games and ratings stay."}
          </p>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive shrink-0"
            onClick={() => setDialog(isOwner ? "delete" : "leave")}
          >
            {isOwner ? (
              <Trash2 className="w-4 h-4 mr-1.5" />
            ) : (
              <LogOut className="w-4 h-4 mr-1.5" />
            )}
            {isOwner ? "Delete space" : "Leave space"}
          </Button>
        </div>
      </Section>

      <SpaceNameDialog
        open={dialog === "rename"}
        title="Rename space"
        description="Everyone in the space sees the new name."
        submitLabel="Save"
        initialName={space.name}
        onSubmit={async (name) => {
          setSpace(await renamePadelSpace(space.id, { name }));
          setDialog(null);
          router.refresh();
        }}
        onClose={() => setDialog(null)}
      />
      <ConfirmModal
        open={dialog === "delete" || dialog === "leave"}
        onOpenChange={(open) => !open && setDialog(null)}
        type={dialog === "delete" ? "delete" : "confirm"}
        title={
          dialog === "delete" ? `Delete ${space.name}?` : `Leave ${space.name}?`
        }
        description={
          dialog === "delete"
            ? `All ${space.games} ${space.games === 1 ? "game" : "games"} and every rating in the space are deleted. This can't be undone.`
            : "You won't see the space any more, unless the owner adds you again."
        }
        isLoading={isPending}
        onConfirm={removeSpace}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="space-y-3">
    <div>
      <h2 className="font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const UserRow = ({
  user,
  isYou,
  title,
  badge,
  onRemove,
  removeLabel,
  disabled = false,
}: {
  user: PadelSpaceDetails["owner"];
  isYou: boolean;
  /** Shown above the email, like the player's name */
  title?: string;
  badge?: string;
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
}) => (
  <li className="flex items-center gap-3 px-4 py-3">
    <Avatar src={user.avatarUrl} email={user.email} size="sm" />
    <div className="flex-1 min-w-0">
      {title && <p className="text-sm font-medium break-words">{title}</p>}
      <p
        className={
          title
            ? "text-xs text-muted-foreground break-all"
            : "text-sm break-all"
        }
      >
        {user.email}
        {isYou && <span className="text-muted-foreground"> (you)</span>}
      </p>
    </div>
    {badge && (
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {badge}
      </span>
    )}
    {onRemove && (
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        aria-label={removeLabel ?? `Remove ${user.email}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>
    )}
  </li>
);
