import type { AttendanceStatus, Grade, ReportMetrics } from '../types';

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Билим сапаты: "4" жана "5" алгандардын үлүшү (%) */
export function qualityRate(values: number[]): number {
  if (values.length === 0) return 0;
  return (values.filter((v) => v >= 4).length / values.length) * 100;
}

/** Жетишүү: "3" жана андан жогору алгандардын үлүшү (%) */
export function successRate(values: number[]): number {
  if (values.length === 0) return 0;
  return (values.filter((v) => v >= 3).length / values.length) * 100;
}

/** Катышуу: келген же кечиккен окуучулардын үлүшү (%) */
export function attendanceRate(statuses: AttendanceStatus[]): number {
  if (statuses.length === 0) return 0;
  return (statuses.filter((s) => s === 'present' || s === 'late').length / statuses.length) * 100;
}

export function computeMetrics(grades: Grade[], statuses: AttendanceStatus[]): ReportMetrics {
  const values = grades.map((g) => g.value);
  return {
    avgGrade: round(average(values), 2),
    quality: round(qualityRate(values), 1),
    success: round(successRate(values), 1),
    attendance: round(attendanceRate(statuses), 1),
    gradesCount: values.length,
  };
}

export function round(n: number, digits = 1): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

export function fmt(n: number, digits = 1): string {
  if (!n) return '—';
  return n.toFixed(digits);
}

export function pct(n: number): string {
  if (!n) return '—';
  return `${n.toFixed(1)}%`;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Бааны түскө жараша тону */
export function gradeTone(v: number): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  if (!v) return 'neutral';
  if (v >= 4.5) return 'success';
  if (v >= 3.5) return 'info';
  if (v >= 2.75) return 'warning';
  return 'danger';
}

export function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  // BOM — Excel кириллицаны туура ачышы үчүн
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
