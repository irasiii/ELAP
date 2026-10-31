import { crestInitials } from '@elap/core';
import type { Team } from '@elap/core';

const PALETTE = ['#7AA2FF', '#FF8A7A', '#9FE3B4', '#FFB547', '#E8E8E8', '#7FD3FF', '#D6A6FF'];

/** Team logo from the data provider, or coloured initials when none is available. */
export function Crest({ team, size = 32 }: { team: Team; size?: number }) {
  if (team.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={team.logo} alt="" width={size} height={size} className="crest-img" loading="lazy" />;
  }
  const initials = crestInitials(team.name);
  const bg = PALETTE[team.id % PALETTE.length];
  return (
    <span className="crest" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }} aria-hidden="true">
      {initials}
    </span>
  );
}
