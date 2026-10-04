const MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
export const WEEKDAYS = ['Дүйшөмбү', 'Шейшемби', 'Шаршемби', 'Бейшемби', 'Жума', 'Ишемби', 'Жекшемби'];
const WEEKDAYS_SHORT = ['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жк'];

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** 1 = дүйшөмбү ... 7 = жекшемби */
export function weekday(iso: string): number {
  const w = parseISO(iso).getDay();
  return w === 0 ? 7 : w;
}

export function isSchoolDay(iso: string): boolean {
  return weekday(iso) <= 5;
}

/** Акыркы окуу күнү (бүгүн же андан мурунку жумуш күнү) */
export function lastSchoolDay(from = todayISO()): string {
  let d = from;
  while (!isSchoolDay(d)) d = addDays(d, -1);
  return d;
}

/** Акыркы n окуу күнү, өсүү тартибинде */
export function lastSchoolDays(n: number, from = todayISO()): string[] {
  const days: string[] = [];
  let d = from;
  while (days.length < n) {
    if (isSchoolDay(d)) days.unshift(d);
    d = addDays(d, -1);
  }
  return days;
}

/** Сабак өтүлгөн акыркы n күн (сабактын жуманын күндөрү боюнча) */
export function lessonDays(weekdays: number[], n: number, from = todayISO()): string[] {
  const days: string[] = [];
  let d = from;
  let guard = 0;
  while (days.length < n && guard < 400) {
    if (weekdays.includes(weekday(d))) days.unshift(d);
    d = addDays(d, -1);
    guard++;
  }
  return days;
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatRelative(toISO(d))}, ${hh}:${mm}`;
}

export function formatRelative(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Бүгүн';
  if (iso === addDays(today, -1)) return 'Кечээ';
  if (iso === addDays(today, 1)) return 'Эртең';
  return formatShort(iso);
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[weekday(iso) - 1];
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const name = MONTHS[m - 1];
  return `${name[0].toUpperCase()}${name.slice(1)} ${y}`;
}

/** Акыркы n айдын ачкычтары (YYYY-MM), жаңысы биринчи */
export function recentMonths(n: number, from = todayISO()): string[] {
  const d = parseISO(from);
  const res: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    res.push(toISO(x).slice(0, 7));
  }
  return res;
}
