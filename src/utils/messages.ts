import type { AppData, Message, MessageTarget, Session } from '../types';
import {
  CLASSES,
  DIRECTOR,
  TEACHERS,
  classById,
  parentById,
  studentById,
  studentsOfClass,
  teacherById,
  teacherClassIds,
} from '../data/mockData';

export interface Recipient {
  key: string;
  label: string;
  target: MessageTarget;
}

export function canSeeMessage(m: Message, session: Session): boolean {
  if (m.fromId === session.userId) return true;
  if (session.role === 'district') return false;
  switch (m.to.type) {
    case 'school':
      return true;
    case 'user':
      return m.to.userId === session.userId;
    case 'class': {
      const classId = m.to.classId;
      if (session.role === 'director') return true;
      if (session.role === 'teacher') return teacherClassIds(session.userId).includes(classId);
      const parent = parentById(session.userId);
      return !!parent?.childIds.some((id) => studentById(id).classId === classId);
    }
  }
}

export function visibleMessages(data: AppData, session: Session): Message[] {
  return data.messages
    .filter((m) => canSeeMessage(m, session))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function recipientsFor(session: Session): Recipient[] {
  const list: Recipient[] = [];
  if (session.role === 'director') {
    list.push({ key: 'school', label: 'Бүт мектеп (бардык ата-эне жана мугалимдер)', target: { type: 'school' } });
    CLASSES.forEach((c) => list.push({ key: `class:${c.id}`, label: `${c.name} классынын ата-энелери`, target: { type: 'class', classId: c.id } }));
    TEACHERS.forEach((t) => list.push({ key: `user:${t.id}`, label: `Мугалим: ${t.name}`, target: { type: 'user', userId: t.id } }));
  }
  if (session.role === 'teacher') {
    const classIds = teacherClassIds(session.userId);
    classIds.forEach((id) => list.push({ key: `class:${id}`, label: `${classById(id).name} классынын бардык ата-энелери`, target: { type: 'class', classId: id } }));
    classIds.forEach((id) =>
      studentsOfClass(id).forEach((s) => {
        const p = parentById(s.parentId);
        if (p && !list.some((r) => r.key === `user:${p.id}`)) {
          list.push({ key: `user:${p.id}`, label: `Ата-эне: ${p.name} (${s.name}, ${classById(id).name})`, target: { type: 'user', userId: p.id } });
        }
      }),
    );
    list.push({ key: `user:${DIRECTOR.id}`, label: `Директор: ${DIRECTOR.name}`, target: { type: 'user', userId: DIRECTOR.id } });
  }
  if (session.role === 'parent') {
    const parent = parentById(session.userId);
    const teacherIds = new Set<string>();
    parent?.childIds.forEach((cid) => {
      const cls = classById(studentById(cid).classId);
      teacherIds.add(cls.homeroomTeacherId);
      cls.subjectIds.forEach((sid) => TEACHERS.filter((t) => t.subjectIds.includes(sid)).forEach((t) => teacherIds.add(t.id)));
    });
    const homerooms = new Set(parent?.childIds.map((cid) => classById(studentById(cid).classId).homeroomTeacherId));
    [...teacherIds]
      .sort((a, b) => Number(homerooms.has(b)) - Number(homerooms.has(a)))
      .forEach((id) => {
        const t = teacherById(id)!;
        list.push({ key: `user:${id}`, label: `${homerooms.has(id) ? 'Класс жетекчи' : 'Мугалим'}: ${t.name}`, target: { type: 'user', userId: id } });
      });
    list.push({ key: `user:${DIRECTOR.id}`, label: `Директор: ${DIRECTOR.name}`, target: { type: 'user', userId: DIRECTOR.id } });
  }
  return list;
}

export function shortLabel(label: string): string {
  return label.replace(/^(Мугалим|Ата-эне|Директор|Класс жетекчи): /, '');
}
