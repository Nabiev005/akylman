import type { AppData, AttendanceStatus, Grade, ReportMetrics, Student } from '../types';
import { STUDENTS, studentsOfClass } from '../data/mockData';
import { average, attendanceRate, computeMetrics } from './stats';
import { monthKey } from './date';

interface GradeFilter {
  studentIds?: Set<string>;
  subjectId?: string;
  month?: string;
  teacherId?: string;
}

export function filterGrades(data: AppData, f: GradeFilter): Grade[] {
  return data.grades.filter(
    (g) =>
      (!f.studentIds || f.studentIds.has(g.studentId)) &&
      (!f.subjectId || g.subjectId === f.subjectId) &&
      (!f.teacherId || g.teacherId === f.teacherId) &&
      (!f.month || monthKey(g.date) === f.month),
  );
}

export function filterAttendance(data: AppData, studentIds?: Set<string>, month?: string): AttendanceStatus[] {
  const res: AttendanceStatus[] = [];
  for (const [key, status] of Object.entries(data.attendance)) {
    const [date, sid] = key.split('|');
    if (studentIds && !studentIds.has(sid)) continue;
    if (month && monthKey(date) !== month) continue;
    res.push(status);
  }
  return res;
}

const idsOf = (students: Student[]) => new Set(students.map((s) => s.id));

export function classMetrics(data: AppData, classId: string, subjectId?: string, month?: string): ReportMetrics {
  const ids = idsOf(studentsOfClass(classId));
  return computeMetrics(filterGrades(data, { studentIds: ids, subjectId, month }), filterAttendance(data, ids, month));
}

export function schoolMetrics(data: AppData, month?: string): ReportMetrics {
  return computeMetrics(filterGrades(data, { month }), filterAttendance(data, undefined, month));
}

export function studentAvg(data: AppData, studentId: string, subjectId?: string): number {
  return average(filterGrades(data, { studentIds: new Set([studentId]), subjectId }).map((g) => g.value));
}

export function studentAttendance(data: AppData, studentId: string): number {
  return attendanceRate(filterAttendance(data, new Set([studentId])));
}

export interface RiskEntry {
  student: Student;
  avg: number;
  attendance: number;
  reasons: string[];
}

/** Жетишүүсү же катышуусу төмөн окуучулар — эрте эскертүү */
export function atRiskStudents(data: AppData, classIds?: string[]): RiskEntry[] {
  const pool = classIds ? STUDENTS.filter((s) => classIds.includes(s.classId)) : STUDENTS;
  const res: RiskEntry[] = [];
  for (const student of pool) {
    const avg = studentAvg(data, student.id);
    const att = studentAttendance(data, student.id);
    const reasons: string[] = [];
    if (avg && avg < 3.3) reasons.push('Орточо баа төмөн');
    if (att && att < 88) reasons.push('Көп калтырат');
    if (reasons.length) res.push({ student, avg, attendance: att, reasons });
  }
  return res.sort((a, b) => a.avg - b.avg);
}

export function attendanceKey(date: string, studentId: string): string {
  return `${date}|${studentId}`;
}
