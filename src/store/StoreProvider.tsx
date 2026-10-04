import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppData, Session } from '../types';
import { createInitialData } from '../data/mockData';
import { uid } from '../utils/stats';
import { todayISO } from '../utils/date';
import { StoreContext, type Store } from './context';

const DATA_KEY = 'akylman.data.v1';
const SESSION_KEY = 'akylman.session.v1';

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage жеткиликсиз болсо (жеке режим ж.б.) — эстутумда гана иштейт
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => load<AppData>(DATA_KEY) ?? createInitialData());
  const [session, setSession] = useState<Session | null>(() => load<Session>(SESSION_KEY));

  useEffect(() => save(DATA_KEY, data), [data]);
  useEffect(() => save(SESSION_KEY, session), [session]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const resetDemo = useCallback(() => setData(createInitialData()), []);

  const store = useMemo<Store>(
    () => ({
      data,
      session,
      login: setSession,
      logout: () => setSession(null),

      setGrade: ({ studentId, subjectId, teacherId, date, value }) =>
        update((d) => {
          const rest = d.grades.filter((g) => !(g.studentId === studentId && g.subjectId === subjectId && g.date === date));
          if (value === null) return { ...d, grades: rest };
          return { ...d, grades: [...rest, { id: uid('g'), studentId, subjectId, teacherId, date, value }] };
        }),

      setAttendance: (date, entries) =>
        update((d) => {
          const next = { ...d.attendance };
          for (const [studentId, status] of Object.entries(entries)) next[`${date}|${studentId}`] = status;
          return { ...d, attendance: next };
        }),

      addHomework: (hw) =>
        update((d) => ({ ...d, homework: [{ ...hw, id: uid('h'), createdAt: todayISO() }, ...d.homework] })),

      removeHomework: (id) => update((d) => ({ ...d, homework: d.homework.filter((h) => h.id !== id) })),

      toggleHomeworkDone: (homeworkId, studentId) =>
        update((d) => {
          const key = `${homeworkId}|${studentId}`;
          const next = { ...d.homeworkDone };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { ...d, homeworkDone: next };
        }),

      addTeacherReport: (r) =>
        update((d) => ({
          ...d,
          teacherReports: [{ ...r, id: uid('r'), status: 'submitted', createdAt: new Date().toISOString() }, ...d.teacherReports],
        })),

      setTeacherReportStatus: (id, status) =>
        update((d) => ({ ...d, teacherReports: d.teacherReports.map((r) => (r.id === id ? { ...r, status } : r)) })),

      addSchoolReport: (r) =>
        update((d) => ({
          ...d,
          schoolReports: [{ ...r, id: uid('sr'), createdAt: new Date().toISOString() }, ...d.schoolReports],
        })),

      sendMessage: (m) =>
        update((d) => ({ ...d, messages: [...d.messages, { ...m, id: uid('m'), createdAt: new Date().toISOString() }] })),

      resetDemo,
    }),
    [data, session, update, resetDemo],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
