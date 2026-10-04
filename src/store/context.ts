import { createContext, useContext } from 'react';
import type {
  AppData,
  AttendanceStatus,
  GradeValue,
  Homework,
  Message,
  ReportStatus,
  SchoolReport,
  Session,
  TeacherReport,
} from '../types';

export interface Store {
  data: AppData;
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
  setGrade: (args: { studentId: string; subjectId: string; teacherId: string; date: string; value: GradeValue | null }) => void;
  setAttendance: (date: string, entries: Record<string, AttendanceStatus>) => void;
  addHomework: (hw: Omit<Homework, 'id' | 'createdAt'>) => void;
  removeHomework: (id: string) => void;
  toggleHomeworkDone: (homeworkId: string, studentId: string) => void;
  addTeacherReport: (r: Omit<TeacherReport, 'id' | 'createdAt' | 'status'>) => void;
  setTeacherReportStatus: (id: string, status: ReportStatus) => void;
  addSchoolReport: (r: Omit<SchoolReport, 'id' | 'createdAt'>) => void;
  sendMessage: (m: Omit<Message, 'id' | 'createdAt'>) => void;
  resetDemo: () => void;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore StoreProvider ичинде колдонулушу керек');
  return ctx;
}
