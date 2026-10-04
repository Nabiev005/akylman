import type {
  AppData,
  AttendanceStatus,
  ClassRoom,
  DistrictSchool,
  Grade,
  GradeValue,
  Homework,
  Message,
  Parent,
  School,
  SchoolReport,
  Student,
  Subject,
  Teacher,
  TeacherReport,
} from '../types';
import { addDays, lastSchoolDay, lastSchoolDays, lessonDays, monthKey, recentMonths, todayISO } from '../utils/date';
import { computeMetrics } from '../utils/stats';

/* ------------------------------------------------------------------ */
/*  Туруктуу маалыматтар (мектептин структурасы)                       */
/* ------------------------------------------------------------------ */

export const SCHOOL: School = {
  id: 'sch_1',
  name: 'Баетов №1 орто мектеби',
  village: 'Баетов айылы',
  district: 'Ак-Талаа району',
  region: 'Нарын облусу',
};

export const DIRECTOR = { id: 'd1', name: 'Сатыбалдиева Чолпон Токтосуновна' };
export const DISTRICT_USER = { id: 'r1', name: 'Алымбеков Кубат', office: 'Ак-Талаа райондук билим берүү бөлүмү' };

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Математика', weekdays: [1, 2, 3, 4, 5] },
  { id: 'kyr', name: 'Кыргыз тили', weekdays: [1, 3, 5] },
  { id: 'rus', name: 'Орус тили', weekdays: [2, 4] },
  { id: 'eng', name: 'Англис тили', weekdays: [1, 3, 4] },
  { id: 'phys', name: 'Физика', weekdays: [2, 5] },
  { id: 'hist', name: 'Кыргызстан тарыхы', weekdays: [3, 5] },
  { id: 'bio', name: 'Биология', weekdays: [2, 4] },
  { id: 'inf', name: 'Информатика', weekdays: [1, 4] },
];

export const TEACHERS: Teacher[] = [
  { id: 't1', name: 'Касымов Бакыт Асанович', phone: '+996 700 11 22 33', subjectIds: ['math'] },
  { id: 't2', name: 'Токтосунова Гүлнара Сапаровна', phone: '+996 555 21 43 65', subjectIds: ['kyr'] },
  { id: 't3', name: 'Мамбетов Азамат Кубанычбекович', phone: '+996 777 32 54 76', subjectIds: ['phys', 'inf'] },
  { id: 't4', name: 'Жээнбекова Айгүл Маратовна', phone: '+996 702 43 65 87', subjectIds: ['eng'] },
  { id: 't5', name: 'Осмонова Динара Бекболотовна', phone: '+996 550 54 76 98', subjectIds: ['rus', 'hist'] },
  { id: 't6', name: 'Сыдыков Нурлан Токтогулович', phone: '+996 708 65 87 09', subjectIds: ['bio'] },
];

export const CLASSES: ClassRoom[] = [
  { id: 'c5a', name: '5-А', homeroomTeacherId: 't4', subjectIds: ['math', 'kyr', 'rus', 'eng', 'hist', 'bio'] },
  { id: 'c8b', name: '8-Б', homeroomTeacherId: 't2', subjectIds: ['math', 'kyr', 'rus', 'eng', 'phys', 'hist', 'bio', 'inf'] },
  { id: 'c11a', name: '11-А', homeroomTeacherId: 't1', subjectIds: ['math', 'kyr', 'rus', 'eng', 'phys', 'hist', 'bio', 'inf'] },
];

const ROSTER: Record<string, [string, string][]> = {
  c5a: [
    ['Адылбеков Айбек', 'Адылбекова Нургүл'],
    ['Асанова Нурайым', 'Асанов Мелис'],
    ['Бекболотов Тилек', 'Бекболотова Жылдыз'],
    ['Жумабаева Аружан', 'Жумабаев Эркин'],
    ['Курманбеков Эрлан', 'Курманбекова Сабира'],
    ['Мамытова Бегимай', 'Мамытов Кайрат'],
    ['Нурланов Адилет', 'Нурланова Айнура'],
    ['Токтогулова Сезим', 'Токтогулов Руслан'],
  ],
  c8b: [
    ['Адылбеков Асан', 'Адылбекова Нургүл'],
    ['Бакытова Айпери', 'Бакытов Улан'],
    ['Кадыров Эмил', 'Кадырова Гүлмира'],
    ['Сапарбекова Гүлжан', 'Сапарбеков Таалай'],
    ['Абдыкадыров Бакай', 'Абдыкадырова Чынара'],
    ['Эсенова Мээрим', 'Эсенов Самат'],
    ['Өмүрбеков Нурсултан', 'Өмүрбекова Бактыгүл'],
    ['Чыныбаева Алтынай', 'Чыныбаев Мирбек'],
  ],
  c11a: [
    ['Шаршеналиев Мирлан', 'Шаршеналиева Динара'],
    ['Касымова Элнура', 'Касымов Женишбек'],
    ['Темирбеков Даниял', 'Темирбекова Асель'],
    ['Акматова Жибек', 'Акматов Бактыбек'],
    ['Үсөнов Талант', 'Үсөнова Гүлзат'],
    ['Байышова Канышай', 'Байышов Нурбек'],
    ['Жоробеков Азамат', 'Жоробекова Майрам'],
    ['Мураталиева Айдана', 'Мураталиев Эмилбек'],
  ],
};

function buildPeople(): { students: Student[]; parents: Parent[] } {
  const students: Student[] = [];
  const parents: Parent[] = [];
  const byName = new Map<string, Parent>();
  let sIdx = 1;
  let pIdx = 1;
  for (const cls of CLASSES) {
    for (const [studentName, parentName] of ROSTER[cls.id]) {
      let parent = byName.get(parentName);
      if (!parent) {
        const n = pIdx++;
        parent = {
          id: `p${n}`,
          name: parentName,
          phone: `+996 ${700 + ((n * 37) % 99)} ${String(10 + ((n * 13) % 89)).padStart(2, '0')} ${String(10 + ((n * 29) % 89)).padStart(2, '0')} ${String(10 + ((n * 7) % 89)).padStart(2, '0')}`,
          childIds: [],
        };
        byName.set(parentName, parent);
        parents.push(parent);
      }
      const student: Student = { id: `s${sIdx++}`, name: studentName, classId: cls.id, parentId: parent.id };
      parent.childIds.push(student.id);
      students.push(student);
    }
  }
  return { students, parents };
}

const people = buildPeople();
export const STUDENTS: Student[] = people.students;
export const PARENTS: Parent[] = people.parents;

export const DISTRICT_SCHOOLS: DistrictSchool[] = [
  { id: 'ds2', name: 'Баетов №2 орто мектеби', village: 'Баетов айылы', students: 712, teachers: 51, avgGrade: 3.92, quality: 61.4, attendance: 94.8, status: 'active' },
  { id: 'ds3', name: 'Ак-Талаа орто мектеби', village: 'Ак-Талаа айылы', students: 388, teachers: 33, avgGrade: 3.81, quality: 55.2, attendance: 93.1, status: 'active' },
  { id: 'ds4', name: 'Угют орто мектеби', village: 'Угют айылы', students: 264, teachers: 24, avgGrade: 3.74, quality: 52.7, attendance: 91.6, status: 'pilot' },
  { id: 'ds5', name: 'Терек орто мектеби', village: 'Терек айылы', students: 301, teachers: 27, avgGrade: 3.88, quality: 58.9, attendance: 95.3, status: 'active' },
  { id: 'ds6', name: 'Ак-Жар негизги мектеби', village: 'Ак-Жар айылы', students: 142, teachers: 15, avgGrade: 3.69, quality: 49.5, attendance: 90.2, status: 'pilot' },
  { id: 'ds7', name: 'Ача-Кайыңды орто мектеби', village: 'Ача-Кайыңды айылы', students: 219, teachers: 21, avgGrade: 0, quality: 0, attendance: 0, status: 'connecting' },
  { id: 'ds8', name: 'Кызыл-Жылдыз орто мектеби', village: 'Кызыл-Жылдыз айылы', students: 176, teachers: 18, avgGrade: 0, quality: 0, attendance: 0, status: 'connecting' },
];

/* ------------------------------------------------------------------ */
/*  Өзгөрүлүүчү демо-маалыматтар (баалар, катышуу, тапшырмалар ж.б.)   */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function subjectTeacherId(subjectId: string): string {
  return TEACHERS.find((t) => t.subjectIds.includes(subjectId))?.id ?? 't1';
}

const HOMEWORK_TITLES: Record<string, string[]> = {
  math: ['§12, №245–250 мисалдарды чыгаруу', 'Бөлчөктөр боюнча көнүгүүлөр, 87-бет', 'Теңдемелер системасы, №310–314'],
  kyr: ['«Манас» эпосунан үзүндүнү жаттоо', 'Зат атоочтор боюнча 54-көнүгүү', 'Дилбаян: «Менин айылым»'],
  rus: ['Упражнение 132, стр. 61', 'Выучить словарные слова, стр. 40'],
  eng: ['Unit 3: жаңы сөздөрдү жаттоо', 'Workbook p. 24, ex. 1–4'],
  phys: ['§8 окуу, 3-көнүгүүнүн суроолору', 'Лабораториялык иштин отчетун даярдоо'],
  hist: ['§5 «Кыргыз каганаты» темасын окуу', 'Хронологиялык таблица түзүү'],
  bio: ['§10 «Өсүмдүктөрдүн клеткасы»', 'Гербарий даярдоо (3 өсүмдүк)'],
  inf: ['Алгоритмдин блок-схемасын түзүү', 'Python: циклдер боюнча 3 тапшырма'],
};

export function createInitialData(): AppData {
  const rand = rng(20261004);
  const today = todayISO();
  const yesterday = addDays(today, -1);

  // Ар бир окуучунун "мүмкүнчүлүгү" — баалар ушуга жакын болот
  const ability = new Map<string, number>();
  const absenceRisk = new Map<string, number>();
  for (const s of STUDENTS) {
    ability.set(s.id, 3.1 + rand() * 1.8);
    absenceRisk.set(s.id, 0.03 + rand() * 0.04);
  }
  // Көзөмөлгө алынуучу окуучулар (демо үчүн)
  ability.set('s12', 2.85); // Сапарбекова Гүлжан
  absenceRisk.set('s12', 0.16);
  ability.set('s9', 4.75); // Адылбеков Асан
  ability.set('s21', 2.95); // Үсөнов Талант
  absenceRisk.set('s21', 0.12);

  // --- Баалар
  const grades: Grade[] = [];
  let gIdx = 1;
  for (const cls of CLASSES) {
    const classStudents = STUDENTS.filter((s) => s.classId === cls.id);
    for (const subjectId of cls.subjectIds) {
      const subject = SUBJECTS.find((x) => x.id === subjectId)!;
      const days = lessonDays(subject.weekdays, subject.weekdays.length >= 5 ? 16 : 9, yesterday);
      for (const date of days) {
        for (const st of classStudents) {
          if (rand() > 0.38) continue;
          const raw = ability.get(st.id)! + (rand() - 0.5) * 1.7;
          const value = Math.max(2, Math.min(5, Math.round(raw))) as GradeValue;
          grades.push({
            id: `g${gIdx++}`,
            studentId: st.id,
            subjectId,
            teacherId: subjectTeacherId(subjectId),
            date,
            value,
          });
        }
      }
    }
  }

  // --- Катышуу (бүгүнкү күн мугалим тарабынан белгилениши үчүн бош калат)
  const attendance: Record<string, AttendanceStatus> = {};
  for (const date of lastSchoolDays(20, yesterday)) {
    for (const st of STUDENTS) {
      const r = rand();
      const risk = absenceRisk.get(st.id)!;
      let status: AttendanceStatus = 'present';
      if (r < risk) status = 'absent';
      else if (r < risk + 0.025) status = 'late';
      else if (r < risk + 0.04) status = 'excused';
      attendance[`${date}|${st.id}`] = status;
    }
  }

  // --- Үй тапшырмалары
  const homework: Homework[] = [];
  const homeworkDone: Record<string, boolean> = {};
  let hIdx = 1;
  for (const cls of CLASSES) {
    const classStudents = STUDENTS.filter((s) => s.classId === cls.id);
    cls.subjectIds.forEach((subjectId, i) => {
      const titles = HOMEWORK_TITLES[subjectId];
      const count = i % 3 === 0 ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const createdAt = lastSchoolDays(1, addDays(today, -(k * 4 + (i % 3) + 1)))[0];
        const dueDate = addDays(createdAt, k === 0 ? 3 + (i % 3) : 2);
        const hw: Homework = {
          id: `h${hIdx++}`,
          classId: cls.id,
          subjectId,
          teacherId: subjectTeacherId(subjectId),
          title: titles[(k + i) % titles.length],
          description: 'Дептерге таза жазып, кийинки сабакка алып келиңиз.',
          createdAt,
          dueDate,
        };
        homework.push(hw);
        for (const st of classStudents) {
          if (dueDate < today ? rand() < 0.85 : rand() < 0.3) homeworkDone[`${hw.id}|${st.id}`] = true;
        }
      }
    });
  }

  // --- Мугалимдердин мурунку айдагы отчеттору
  const prevMonth = recentMonths(2, today)[1];
  const reportFor = (
    id: string,
    teacherId: string,
    classId: string,
    subjectId: string,
    status: TeacherReport['status'],
    topics: string,
  ): TeacherReport => {
    const studentIds = new Set(STUDENTS.filter((s) => s.classId === classId).map((s) => s.id));
    const g = grades.filter((x) => x.subjectId === subjectId && studentIds.has(x.studentId) && monthKey(x.date) === prevMonth);
    const a = Object.entries(attendance)
      .filter(([k]) => monthKey(k) === prevMonth && studentIds.has(k.split('|')[1]))
      .map(([, v]) => v);
    return {
      id,
      teacherId,
      classId,
      subjectId,
      period: prevMonth,
      lessonsHeld: 12,
      topics,
      notes: 'Окуучулардын көпчүлүгү теманы өздөштүрдү. Артта калган окуучулар менен кошумча сабак өткөрүлдү.',
      metrics: computeMetrics(g, a),
      status,
      createdAt: `${addDays(today, -3)}T15:20:00`,
    };
  };

  const teacherReports: TeacherReport[] = [
    reportFor('r1', 't2', 'c8b', 'kyr', 'approved', 'Зат атооч, сын атооч; «Манас» эпосу (үзүндүлөр)'),
    reportFor('r2', 't3', 'c8b', 'phys', 'submitted', 'Жылуулук кубулуштары, жылуулук өткөрүмдүүлүк'),
    reportFor('r3', 't4', 'c5a', 'eng', 'submitted', 'Unit 1–2: My family, My school'),
  ];

  // --- Райондогу башка мектептерден келген отчеттор
  const schoolReports: SchoolReport[] = DISTRICT_SCHOOLS.filter((s) => s.status !== 'connecting')
    .slice(0, 3)
    .map((s, i) => ({
      id: `sr${i + 1}`,
      schoolId: s.id,
      schoolName: s.name,
      period: prevMonth,
      students: s.students,
      teachers: s.teachers,
      metrics: { avgGrade: s.avgGrade, quality: s.quality, success: 96 + i, attendance: s.attendance, gradesCount: 4000 + i * 731 },
      note: 'Айлык отчет Akylman.kg аркылуу автоматтык түрдө түзүлдү.',
      createdAt: `${addDays(today, -(i + 1))}T10:${10 + i * 7}:00`,
    }));

  // --- Билдирүүлөр
  const messages: Message[] = [
    {
      id: 'm1',
      fromId: DIRECTOR.id,
      fromName: DIRECTOR.name,
      fromRole: 'director',
      to: { type: 'school' },
      toLabel: 'Бүт мектеп',
      text: 'Урматтуу ата-энелер! 10-октябрда саат 17:00дө мектептин чоң залында жалпы ата-энелер жыйыны болот. Катышууңуздарды суранабыз.',
      createdAt: `${addDays(today, -2)}T09:15:00`,
    },
    {
      id: 'm2',
      fromId: 't2',
      fromName: 'Токтосунова Гүлнара Сапаровна',
      fromRole: 'teacher',
      to: { type: 'class', classId: 'c8b' },
      toLabel: '8-Б классынын ата-энелери',
      text: 'Кийинки жумада 8-Б классы райондук музейге экскурсияга барат. Макулдук баракчасын класс жетекчисине тапшырыңыздар.',
      createdAt: `${addDays(today, -1)}T13:40:00`,
    },
    {
      id: 'm3',
      fromId: 't1',
      fromName: 'Касымов Бакыт Асанович',
      fromRole: 'teacher',
      to: { type: 'user', userId: 'p1' },
      toLabel: 'Адылбекова Нургүл',
      text: 'Саламатсызбы! Асан математика олимпиадасынын райондук турына тандалды. Куттуктайм! Кошумча сабактар шаршемби күнү саат 15:00дө.',
      createdAt: `${lastSchoolDay(addDays(today, -1))}T16:05:00`,
    },
    {
      id: 'm4',
      fromId: 'p1',
      fromName: 'Адылбекова Нургүл',
      fromRole: 'parent',
      to: { type: 'user', userId: 't1' },
      toLabel: 'Касымов Бакыт Асанович',
      text: 'Рахмат, агай! Асан сөзсүз катышат.',
      createdAt: `${lastSchoolDay(addDays(today, -1))}T18:30:00`,
    },
  ];

  return { grades, attendance, homework, homeworkDone, teacherReports, schoolReports, messages };
}

/* ------------------------------------------------------------------ */
/*  Жардамчы издөө функциялары                                        */
/* ------------------------------------------------------------------ */

export const subjectById = (id: string) => SUBJECTS.find((s) => s.id === id)!;
export const classById = (id: string) => CLASSES.find((c) => c.id === id)!;
export const teacherById = (id: string) => TEACHERS.find((t) => t.id === id);
export const studentById = (id: string) => STUDENTS.find((s) => s.id === id)!;
export const parentById = (id: string) => PARENTS.find((p) => p.id === id);
export const studentsOfClass = (classId: string) => STUDENTS.filter((s) => s.classId === classId);

/** Мугалим кайсы класста кайсы сабакты окутат */
export function teacherAssignments(teacherId: string): { classId: string; subjectId: string }[] {
  const t = teacherById(teacherId);
  if (!t) return [];
  const res: { classId: string; subjectId: string }[] = [];
  for (const cls of CLASSES) {
    for (const subjectId of cls.subjectIds) {
      if (t.subjectIds.includes(subjectId)) res.push({ classId: cls.id, subjectId });
    }
  }
  return res;
}

export function teacherClassIds(teacherId: string): string[] {
  const ids = new Set(teacherAssignments(teacherId).map((a) => a.classId));
  CLASSES.forEach((c) => c.homeroomTeacherId === teacherId && ids.add(c.id));
  return CLASSES.filter((c) => ids.has(c.id)).map((c) => c.id);
}

export function userName(role: string, userId: string): string {
  if (role === 'director') return DIRECTOR.name;
  if (role === 'district') return DISTRICT_USER.name;
  if (role === 'teacher') return teacherById(userId)?.name ?? '';
  return parentById(userId)?.name ?? '';
}
