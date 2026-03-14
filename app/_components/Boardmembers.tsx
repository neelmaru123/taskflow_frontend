"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiX,
  FiSearch,
  FiUserPlus,
  FiUsers,
  FiTrash2,
  FiLoader,
  FiCheckCircle,
  FiAlertTriangle,
  FiCornerDownLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserData = {
  id: string;
  username: string;
  email: string;
  avatarColor?: string;
};

type Member = {
  userId: string;
  boardId: string;
  user: UserData;
  createdAt?: string;
  role?: "owner" | "member";
};

type SearchState =
  | "idle"
  | "searching"
  | "found"
  | "not_found"
  | "error"
  | "already_added";

type BoardMembersProps = {
  boardId: string;
  boardTitle: string;
  currentUserId: string;
  onClose: () => void;
  isOwner: boolean; // ← new
  fetchMembers: (boardId: string) => Promise<Member[]>;
  searchUserByEmail: (email: string) => Promise<UserData | null>;
  addMember: (boardId: string, userId: string) => Promise<boolean>;
  removeMember: (boardId: string, userId: string) => Promise<boolean>;
};

// ─── Avatar chip ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id?.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({
  user,
  size = "md",
}: {
  user: UserData | null;
  size?: "sm" | "md" | "lg";
}) {
  const initials = user?.username?.slice(0, 2).toUpperCase();
  const color = user?.avatarColor ?? getAvatarColor(user?.id);
  const sizeClass = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
  }[size];
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
      <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="h-3 w-28 bg-slate-800 rounded-md animate-pulse" />
        <div className="h-2.5 w-40 bg-slate-800/60 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BoardMembers({
  boardId,
  boardTitle,
  currentUserId,
  onClose,
  isOwner, // ← destructured
  fetchMembers,
  searchUserByEmail,
  addMember,
  removeMember,
}: BoardMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);

  const [email, setEmail] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch existing members ────────────────────────────────────────────────
  async function loadMembers() {
    setMembersLoading(true);
    setMembersError(false);
    try {
      const data = await fetchMembers(boardId);
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members: ", err);
      setMembersError(true);
    } finally {
      setMembersLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
    // Only focus the search input if the user is an owner
    if (isOwner) setTimeout(() => inputRef.current?.focus(), 120);
  }, [boardId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ── Debounced email search ────────────────────────────────────────────────
  function handleEmailChange(value: string) {
    setEmail(value);
    setFoundUser(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSearchState("idle");
      return;
    }
    setSearchState("searching");
    debounceRef.current = setTimeout(async () => {
      try {
        const user = await searchUserByEmail(trimmed);
        if (!user) {
          setSearchState("not_found");
          return;
        }
        const alreadyAdded = members.some((m) => m.userId === user.id);
        if (alreadyAdded) {
          setFoundUser(user);
          setSearchState("already_added");
          return;
        }
        setFoundUser(user);
        setSearchState("found");
      } catch {
        setSearchState("error");
      }
    }, 500);
  }

  // ── Add member ────────────────────────────────────────────────────────────
  async function handleAddMember() {
    if (!foundUser || searchState !== "found") return;
    setAddingId(foundUser.id);
    try {
      const ok = await addMember(boardId, foundUser.id);
      if (!ok) {
        toast.error("Failed to add member");
        return;
      }
      const newMember: Member = {
        userId: foundUser.id,
        boardId,
        user: {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
        },
      };
      setMembers((prev) => [...prev, newMember]);
      setEmail("");
      setFoundUser(null);
      setSearchState("idle");
      toast.success(`${foundUser.username} added to board`);
    } catch {
      toast.error("Failed to add member");
    } finally {
      setAddingId(null);
    }
  }

  // ── Remove member ─────────────────────────────────────────────────────────
  async function handleRemoveMember(member: Member) {
    setRemovingId(member.userId);
    try {
      const ok = await removeMember(boardId, member.userId);
      if (!ok) {
        toast.error("Failed to remove member");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      toast.success(`${member.user.username} removed`);
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  }

  // ── Search result pill ────────────────────────────────────────────────────
  function SearchResult() {
    if (searchState === "idle") return null;
    if (searchState === "searching") {
      return (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-500">
          <FiLoader size={13} className="animate-spin shrink-0" />
          Searching...
        </div>
      );
    }
    if (searchState === "not_found") {
      return (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-500">
          <FiAlertTriangle size={13} className="text-amber-500 shrink-0" />
          No user found with that email
        </div>
      );
    }
    if (searchState === "error") {
      return (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <FiAlertTriangle size={13} className="shrink-0" />
          Search failed — try again
        </div>
      );
    }
    if (searchState === "already_added" && foundUser) {
      return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700">
          <Avatar user={foundUser} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {foundUser.username}
            </p>
            <p className="text-xs text-slate-500 truncate">{foundUser.email}</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 shrink-0">
            <FiCheckCircle size={12} />
            Already a member
          </span>
        </div>
      );
    }
    if (searchState === "found" && foundUser) {
      return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800 border border-blue-500/30">
          <Avatar user={foundUser} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {foundUser.username}
            </p>
            <p className="text-xs text-slate-500 truncate">{foundUser.email}</p>
          </div>
          <button
            onClick={handleAddMember}
            disabled={!!addingId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            {addingId === foundUser.id ? (
              <FiLoader size={12} className="animate-spin" />
            ) : (
              <FiUserPlus size={12} />
            )}
            {addingId === foundUser.id ? "Adding..." : "Add"}
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full md:max-w-md bg-slate-900 border border-slate-700/80 rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[92dvh] md:max-h-[85vh] overflow-hidden">
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 md:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>

        {/* Top accent */}
        <div className="h-0.5 bg-blue-600/60 w-full mt-3 md:mt-0 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <FiUsers size={14} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-100">
                {isOwner ? "Board Members" : "Members"}
              </h2>
              <p className="text-[10px] text-slate-500 truncate">
                {boardTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-all"
          >
            <FiX size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* ── Invite section — owner only ─────────────────────────────────── */}
          {isOwner && (
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                <FiUserPlus size={10} />
                Invite by email
              </label>

              <div className="relative mb-2">
                <FiSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddMember();
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              <SearchResult />
            </div>
          )}

          {/* Divider — only shown when owner (so invite section exists above) */}
          {isOwner && <div className="border-t border-slate-800" />}

          {/* ── Members list — everyone sees this ──────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <FiUsers size={10} />
                {isOwner ? "Members" : "People on this board"}
              </label>
              {!membersLoading && !membersError && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 tabular-nums">
                  {members.length}
                </span>
              )}
            </div>

            {/* Loading skeletons */}
            {membersLoading && (
              <div className="space-y-1">
                <MemberRowSkeleton />
                <MemberRowSkeleton />
                <MemberRowSkeleton />
              </div>
            )}

            {/* Error */}
            {membersError && !membersLoading && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle
                    size={13}
                    className="text-red-400 shrink-0"
                  />
                  <span className="text-xs text-red-400 font-medium">
                    Failed to load members
                  </span>
                </div>
                <button
                  onClick={loadMembers}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!membersLoading && !membersError && members.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-6">
                {isOwner
                  ? "No members yet. Invite someone above."
                  : "No members on this board yet."}
              </p>
            )}

            {/* Member rows */}
            {!membersLoading && !membersError && members.length > 0 && (
              <ul className="space-y-1">
                {members.map((member) => {
                  const isBoardOwner = member.user?.id === currentUserId;
                  const isRemoving = removingId === member.user?.id;
                  return (
                    <li
                      key={`${member.userId}-${member.boardId}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
                    >
                      {/* Avatar */}
                      <Avatar user={member.user} size="md" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {member.user?.username}
                          </p>
                          {isBoardOwner && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 shrink-0">
                              <FiCornerDownLeft size={9} />
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {member.user?.email}
                        </p>
                      </div>

                      {/* Remove button — owner only, hidden for self */}
                      {isOwner && !isBoardOwner && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          disabled={!!removingId}
                          title="Remove member"
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg transition-all disabled:opacity-40 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          {isRemoving ? (
                            <FiLoader
                              size={13}
                              className="animate-spin text-slate-400"
                            />
                          ) : (
                            <FiTrash2 size={13} />
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer safe area */}
        <div className="h-safe md:hidden pb-2 shrink-0" />
      </div>
    </div>
  );
}

export default BoardMembers;
