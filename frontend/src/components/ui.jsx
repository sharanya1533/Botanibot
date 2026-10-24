// Moisture ring gauge: full ring = freshly watered, empty = due.
export function MoistureRing({ plant, size = 64 }) {
  const due = new Date(plant.nextDueAt).getTime();
  const last = new Date(plant.lastWateredAt || plant.createdAt).getTime();
  const span = Math.max(1, due - last);
  const progress = Math.min(1, Math.max(0, (Date.now() - last) / span)); // 0 fresh → 1 due
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const overdue = due < Date.now();
  const color = overdue ? '#c2410c' : progress > 0.8 ? '#a16207' : '#4d7c0f';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5ddc8" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
      />
    </svg>
  );
}

export function dueLabel(plant) {
  const diff = new Date(plant.nextDueAt) - Date.now();
  if (diff < 0) return { text: `overdue by ${Math.ceil(-diff / 86400000)}d`, cls: 'text-terra font-bold' };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days >= 1) return { text: `in ${days}d`, cls: 'text-stone-500' };
  return { text: `in ${hours}h`, cls: 'text-amber-700 font-bold' };
}
