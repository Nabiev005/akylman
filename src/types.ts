export type Role = 'teacher' | 'parent' | 'director' | 'district';

export interface Session {
  role: Role;
  userId: string;
}

export interface School {
  id: string;
  name: string;
  village: string;
  district: string;
  region: string;
}

export interface Subject {
  id: string;
  name: string;
  // Жуманын кайсы күндөрү өтүлөт (1 = дүйшөмбү ... 5 = жума)
  weekdays: number[];
}

export interface ClassRoom {
  id: string;
  name: string;
  homeroomTeacherId: string;
  subjectIds: string[];
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  subjectIds: string[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  parentId: string;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  childIds: string[];
}

export type GradeValue = 2 | 3 | 4 | 5;

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  date: string;
  value: GradeValue;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface Homework {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
}

export interface ReportMetrics {
  avgGrade: number;
  quality: number;
  success: number;
  attendance: number;
  gradesCount: number;
}

export type ReportStatus = 'submitted' | 'approved' | 'returned';

export interface TeacherReport {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  period: string; // YYYY-MM
  lessonsHeld: number;
  topics: string;
  notes: string;
  metrics: ReportMetrics;
  status: ReportStatus;
  createdAt: string;
}

export interface SchoolReport {
  id: string;
  schoolId: string;
  schoolName: string;
  period: string;
  students: number;
  teachers: number;
  metrics: ReportMetrics;
  note: string;
  createdAt: string;
}

export type MessageTarget =
  | { type: 'school' }
  | { type: 'class'; classId: string }
  | { type: 'user'; userId: string };

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: Role;
  to: MessageTarget;
  toLabel: string;
  text: string;
  createdAt: string;
}

export interface DistrictSchool {
  id: string;
  name: string;
  village: string;
  students: number;
  teachers: number;
  avgGrade: number;
  quality: number;
  attendance: number;
  status: 'active' | 'pilot' | 'connecting';
  live?: boolean;
}

export interface AppData {
  grades: Grade[];
  attendance: Record<string, AttendanceStatus>; // `${date}|${studentId}`
  homework: Homework[];
  homeworkDone: Record<string, boolean>; // `${homeworkId}|${studentId}`
  teacherReports: TeacherReport[];
  schoolReports: SchoolReport[];
  messages: Message[];
}
