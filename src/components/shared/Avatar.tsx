// Single avatar component used everywhere a user is shown.
// Falls back to initials in a solid accent circle if no avatarUrl is set.
interface AvatarUser { username: string; avatarUrl?: string | null }

function initials(name: string): string {
  const parts = name.trim().split(/[\s_-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ user, size = 32 }: { user: AvatarUser; size?: number }) {
  if (user.avatarUrl) {
    return (
      // Plain <img> so it works for any local /avatars/... path without
      // additional next/image configuration.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.username}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full inline-flex items-center justify-center font-semibold select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: '#a78bfa',
        color: '#0a0a0b',
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden
    >
      {initials(user.username)}
    </div>
  );
}
