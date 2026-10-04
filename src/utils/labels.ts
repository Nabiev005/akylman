import type { AttendanceStatus, ReportStatus, Role } from '../types';
import type { Tone } from '../components/ui';

export const ATTENDANCE_META: Record<AttendanceStatus, { label: string; short: string; tone: Tone }> = {
  present: { label: 'Келди', short: '✓', tone: 'success' },
  late: { label: 'Кечикти', short: 'К', tone: 'warning' },
  absent: { label: 'Келген жок', short: 'Н', tone: 'danger' },
  excused: { label: 'Себептүү', short: 'С', tone: 'info' },
};

export const REPORT_STATUS: Record<ReportStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Каралууда', tone: 'warning' },
  approved: { label: 'Бекитилди', tone: 'success' },
  returned: { label: 'Кайтарылды', tone: 'danger' },
};

export const ROLE_LABEL: Record<Role, string> = {
  teacher: 'Мугалим',
  parent: 'Ата-эне',
  director: 'Мектеп директору',
  district: 'Райондук билим берүү бөлүмү',
};
