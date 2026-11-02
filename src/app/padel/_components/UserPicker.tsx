"use client";

import { searchUsers } from "@/app/actions";
import { Avatar } from "@/components/Avatar/Avatar";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export interface PickedUser {
  id: string;
  email: string;
  avatarUrl: string | null;
}

/** Finds a user by email. Users in `excludeIds` aren't shown. */
export const UserPicker = ({
  id,
  excludeIds = [],
  disabled = false,
  onPick,
}: {
  id?: string;
  excludeIds?: string[];
  disabled?: boolean;
  onPick: (user: PickedUser) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedUser[] | null>(null);

  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) {
      setResults(null);
      return;
    }
    let isCurrent = true;
    const timeout = setTimeout(() => {
      searchUsers(search)
        .then((users) => isCurrent && setResults(users))
        .catch(() => isCurrent && setResults([]));
    }, 250);
    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const shown = results?.filter((user) => !excludeIds.includes(user.id));

  return (
    <div className="space-y-2">
      <Input
        id={id}
        type="search"
        value={query}
        disabled={disabled}
        placeholder="Search by email"
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
      />
      {shown &&
        (shown.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">
            Nobody found. They need to sign in to Bragster once first.
          </p>
        ) : (
          <ul className="rounded-lg border border-border divide-y divide-border">
            {shown.slice(0, 6).map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  disabled={disabled}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                  onClick={() => {
                    onPick(user);
                    setQuery("");
                  }}
                >
                  <Avatar src={user.avatarUrl} email={user.email} size="sm" />
                  <span className="break-all">{user.email}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
};
