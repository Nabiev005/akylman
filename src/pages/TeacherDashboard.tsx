import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Plus,
  Send,
  Trash2,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { AppLayout, type NavItem } from '../components/AppLayout';
import {
  Badge,
  BarList,
  Button,
  Card,
  CardHead,
  EmptyState,
  Field,
  FormRow,
  Grid,
  Input,
  ListItem,
  Muted,
  Notice,
  PageHeader,
  Row,
  Select,
  Split,
  StatCard,
  Table,
  TableWrap,
  Textarea,
  toneColors,
  type Tone,
  MiniMetric,
} from '../components/ui';
import { MessagesPage } from './shared/MessagesPage';
import { useStore } from '../store/context';
import {
  classById,
  studentsOfClass,
  subjectById,
  teacherAssignments,
  teacherById,
  teacherClassIds,
} from '../data/mockData';
import type { AttendanceStatus, GradeValue } from '../types';
import { ATTENDANCE_META, REPORT_STATUS } from '../utils/labels';
import {
  addDays,
  formatLong,
  formatRelative,
  formatShort,
  isSchoolDay,
  lastSchoolDay,
  lessonDays,
  monthLabel,
  recentMonths,
  todayISO,
  weekday,
  weekdayShort,
} from '../utils/date';
import { atRiskStudents, attendanceKey, classMetrics, filterGrades, studentAvg } from '../utils/analytics';
import { average, fmt, gradeTone, pct } from '../utils/stats';

type Section = 'home' | 'journal' | 'attendance' | 'homework' | 'reports' | 'messages';

const assignmentKey = (a: { classId: string; subjectId: string }) => `${a.classId}:${a.subjectId}`;
const assignmentLabel = (a: { classId: string; subjectId: string }) => `${classById(a.classId).name} · ${subjectById(a.subjectId).name}`;

export function TeacherDashboard() {
  const { session, data } = useStore();
  const [section, setSection] = useState<Section>('home');
  const [journalKey, setJournalKey] = useState<string | null>(null);
  const teacherId = session!.userId;
  const teacher = teacherById(teacherId)!;

  const today = todayISO();
  const unmarked = isSchoolDay(today)
    ? teacherClassIds(teacherId).filter((cid) => studentsOfClass(cid).some((s) => !data.attendance[attendanceKey(today, s.id)])).length
    : 0;

  const nav: NavItem<Section>[] = [
    { key: 'home', label: 'Башкы бет', icon: <LayoutDashboard size={19} /> },
    { key: 'journal', label: 'Электрондук журнал', icon: <BookOpen size={19} /> },
    { key: 'attendance', label: 'Катышуу', icon: <CalendarCheck size={19} />, badge: unmarked },
    { key: 'homework', label: 'Үй тапшырмалары', icon: <NotebookPen size={19} /> },
    { key: 'reports', label: 'Отчеттор', icon: <FileText size={19} /> },
    { key: 'messages', label: 'Билдирүүлөр', icon: <MessageSquare size={19} /> },
  ];

  const openJournal = (key: string) => {
    setJournalKey(key);
    setSection('journal');
  };

  return (
    <AppLayout nav={nav} active={section} onNavigate={setSection} roleLabel="Мугалим" userName={teacher.name}>
      {section === 'home' && <TeacherHome teacherId={teacherId} onOpenJournal={openJournal} onNavigate={setSection} />}
      {section === 'journal' && <Journal teacherId={teacherId} initialKey={journalKey} />}
      {section === 'attendance' && <AttendancePage teacherId={teacherId} />}
      {section === 'homework' && <HomeworkPage teacherId={teacherId} />}
      {section === 'reports' && <ReportsPage teacherId={teacherId} />}
      {section === 'messages' && <MessagesPage />}
    </AppLayout>
  );
}

/* ================================================================== */
/*  Башкы бет                                                         */
/* ================================================================== */

function TeacherHome({ teacherId, onOpenJournal, onNavigate }: { teacherId: string; onOpenJournal: (key: string) => void; onNavigate: (s: Section) => void }) {
  const { data } = useStore();
  const teacher = teacherById(teacherId)!;
  const assignments = teacherAssignments(teacherId);
  const classIds = teacherClassIds(teacherId);
  const today = todayISO();
  const day = isSchoolDay(today) ? today : lastSchoolDay(today);
  const todayLessons = assignments.filter((a) => subjectById(a.subjectId).weekdays.includes(weekday(day)));
  const studentCount = classIds.reduce((n, id) => n + studentsOfClass(id).length, 0);
  const weekGrades = filterGrades(data, { teacherId }).filter((g) => g.date >= addDays(today, -7));
  const myHomework = data.homework.filter((h) => h.teacherId === teacherId && h.dueDate >= today);
  const risk = atRiskStudents(data, classIds).slice(0, 5);
  const firstName = teacher.name.split(' ')[1];

  return (
    <>
      <PageHeader
        title={`Кош келиңиз, ${firstName}!`}
        subtitle={`${formatLong(today)} · ${teacher.subjectIds.map((s) => subjectById(s).name).join(', ')} мугалими`}
      />

      <Grid $min="210px">
        <StatCard icon={<Users size={22} />} label="Окуучуларым" value={studentCount} hint={`${classIds.length} класс`} />
        <StatCard icon={<BookOpen size={22} />} label="Жумада коюлган баалар" value={weekGrades.length} tone="success" hint={`Орточо: ${fmt(average(weekGrades.map((g) => g.value)), 2)}`} />
        <StatCard icon={<NotebookPen size={22} />} label="Активдүү үй тапшырма" value={myHomework.length} tone="violet" />
        <StatCard icon={<TriangleAlert size={22} />} label="Көзөмөлдөгү окуучулар" value={risk.length} tone="warning" hint="Төмөн баа же көп калтыруу" />
      </Grid>

      <Split>
        <Card>
          <CardHead>
            <h3>{day === today ? 'Бүгүнкү сабактар' : `Акыркы окуу күнү — ${formatShort(day)}`}</h3>
            <Button $variant="secondary" $size="sm" onClick={() => onNavigate('attendance')}>
              <CalendarCheck size={15} /> Катышууну белгилөө
            </Button>
          </CardHead>
          {todayLessons.length === 0 && <EmptyState>Бул күнү сабак жок</EmptyState>}
          {todayLessons.map((a, i) => {
            const m = classMetrics(data, a.classId, a.subjectId);
            return (
              <ListItem key={assignmentKey(a)}>
                <Badge $tone="primary">{i + 1}-сабак</Badge>
                <div className="grow">
                  <div className="title">{assignmentLabel(a)}</div>
                  <div className="sub">{studentsOfClass(a.classId).length} окуучу · орточо баа {fmt(m.avgGrade, 2)} · сапат {pct(m.quality)}</div>
                </div>
                <Button $size="sm" onClick={() => onOpenJournal(assignmentKey(a))}>Журнал</Button>
              </ListItem>
            );
          })}
        </Card>

        <Card>
          <CardHead><h3><TriangleAlert size={18} color="#D97706" /> Көңүл буруңуз</h3></CardHead>
          {risk.length === 0 && <EmptyState>Баары жакшы!</EmptyState>}
          {risk.map((r) => (
            <ListItem key={r.student.id}>
              <div className="grow">
                <div className="title">{r.student.name}</div>
                <div className="sub">{classById(r.student.classId).name} · {r.reasons.join(', ')}</div>
              </div>
              <Badge $tone={gradeTone(r.avg)}>{fmt(r.avg, 1)}</Badge>
            </ListItem>
          ))}
        </Card>
      </Split>

      <Card>
        <CardHead><h3>Класстар боюнча орточо баа (менин сабактарым)</h3></CardHead>
        <BarList
          items={assignments.map((a) => {
            const m = classMetrics(data, a.classId, a.subjectId);
            return { label: assignmentLabel(a), value: m.avgGrade, max: 5, display: fmt(m.avgGrade, 2), tone: gradeTone(m.avgGrade) };
          })}
        />
      </Card>
    </>
  );
}

/* ================================================================== */
/*  Электрондук журнал                                                */
/* ================================================================== */

const GradeCell = styled.select<{ $value: number; $absent: boolean }>`
  appearance: none;
  -webkit-appearance: none;
  width: 38px;
  height: 34px;
  text-align: center;
  text-align-last: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.25s, color 0.25s, transform 0.15s, box-shadow 0.2s;
  border: 1px solid ${({ theme, $value }) => ($value ? 'transparent' : theme.colors.border)};

  &:hover {
    transform: scale(1.12);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
  ${({ theme, $value, $absent }) => {
    if ($value) {
      const t = toneColors(theme, $value >= 5 ? 'success' : $value === 4 ? 'info' : $value === 3 ? 'warning' : 'danger');
      return `color: ${t.fg}; background: ${t.bg};`;
    }
    return $absent ? `background: ${theme.colors.dangerSoft}; color: ${theme.colors.danger};` : `background: ${theme.colors.surface}; color: ${theme.colors.textMuted};`;
  }}

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
`;

const DateHead = styled.th<{ $today?: boolean }>`
  text-align: center !important;
  line-height: 1.2;
  color: ${({ $today, theme }) => ($today ? theme.colors.primary : theme.colors.textMuted)} !important;
  small {
    display: block;
    font-weight: 500;
    text-transform: none;
  }
`;

function Journal({ teacherId, initialKey }: { teacherId: string; initialKey: string | null }) {
  const { data, setGrade } = useStore();
  const assignments = teacherAssignments(teacherId);
  const [key, setKey] = useState(initialKey ?? assignmentKey(assignments[0]));
  const [classId, subjectId] = key.split(':');
  const subject = subjectById(subjectId);
  const today = todayISO();
  const dates = lessonDays(subject.weekdays, 10, today);
  const students = studentsOfClass(classId);
  const m = classMetrics(data, classId, subjectId);

  const gradeMap = new Map<string, GradeValue>();
  for (const g of data.grades) if (g.subjectId === subjectId) gradeMap.set(`${g.studentId}|${g.date}`, g.value);

  return (
    <>
      <PageHeader
        title="Электрондук журнал"
        subtitle="Бааны тандаңыз — ал ата-эненин кабинетинде дароо көрүнөт"
        actions={
          <Select value={key} onChange={(e) => setKey(e.target.value)} style={{ minWidth: 220 }}>
            {assignments.map((a) => (
              <option key={assignmentKey(a)} value={assignmentKey(a)}>{assignmentLabel(a)}</option>
            ))}
          </Select>
        }
      />

      <Grid $min="180px">
        <StatCard icon={<BookOpen size={20} />} label="Орточо баа" value={fmt(m.avgGrade, 2)} tone={gradeTone(m.avgGrade)} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Билим сапаты" value={pct(m.quality)} tone="success" hint="«4» жана «5» үлүшү" />
        <StatCard icon={<ClipboardList size={20} />} label="Жетишүү" value={pct(m.success)} tone="info" hint="«3» жана жогору" />
        <StatCard icon={<CalendarCheck size={20} />} label="Катышуу" value={pct(m.attendance)} tone="violet" />
      </Grid>

      <Card>
        <CardHead>
          <h3>«{classById(classId).name}» классы — {subject.name}</h3>
          <Row $gap="0.75rem">
            <Muted>Кызыл фон — окуучу ал күнү келген эмес</Muted>
          </Row>
        </CardHead>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>№</th>
                <th>Окуучу</th>
                {dates.map((d) => (
                  <DateHead key={d} $today={d === today}>
                    {formatShort(d)}
                    <small>{weekdayShort(d)}</small>
                  </DateHead>
                ))}
                <th className="center">Орточо</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const avg = studentAvg(data, s.id, subjectId);
                return (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    {dates.map((d) => {
                      const v = gradeMap.get(`${s.id}|${d}`) ?? 0;
                      const absent = data.attendance[attendanceKey(d, s.id)] === 'absent';
                      return (
                        <td key={d} className="center" style={{ padding: '0.35rem' }}>
                          <GradeCell
                            aria-label={`${s.name}, ${formatShort(d)}`}
                            title={absent ? 'Келген жок' : undefined}
                            $value={v}
                            $absent={absent}
                            value={v || ''}
                            onChange={(e) =>
                              setGrade({
                                studentId: s.id,
                                subjectId,
                                teacherId,
                                date: d,
                                value: e.target.value ? (Number(e.target.value) as GradeValue) : null,
                              })
                            }
                          >
                            <option value="">{absent ? 'н' : '·'}</option>
                            <option value="5">5</option>
                            <option value="4">4</option>
                            <option value="3">3</option>
                            <option value="2">2</option>
                          </GradeCell>
                        </td>
                      );
                    })}
                    <td className="center">
                      <Badge $tone={gradeTone(avg)}>{fmt(avg, 2)}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ================================================================== */
/*  Катышуу                                                           */
/* ================================================================== */

const StatusBtn = styled.button<{ $active: boolean; $tone: Tone }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ theme, $active, $tone }) => ($active ? toneColors(theme, $tone).bg : theme.colors.surface)};
  color: ${({ theme, $active, $tone }) => ($active ? toneColors(theme, $tone).fg : theme.colors.textMuted)};
  border-color: ${({ theme, $active, $tone }) => ($active ? toneColors(theme, $tone).fg : theme.colors.border)};
  transform: ${({ $active }) => ($active ? 'scale(1.04)' : 'none')};
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    border-color: ${({ theme, $tone }) => toneColors(theme, $tone).fg};
  }
  &:active {
    transform: scale(0.94);
  }
`;

function AttendancePage({ teacherId }: { teacherId: string }) {
  const classIds = teacherClassIds(teacherId);
  const [classId, setClassId] = useState(classIds[0]);
  const [date, setDate] = useState(lastSchoolDay());
  return (
    <>
      <PageHeader
        title="Катышуу"
        subtitle="Окуучулардын сабакка катышуусун белгилеңиз — ата-энелер ошол замат кабарланат"
        actions={
          <>
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ width: 'auto' }}>
              {classIds.map((id) => <option key={id} value={id}>{classById(id).name} классы</option>)}
            </Select>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} style={{ width: 'auto' }} />
          </>
        }
      />
      {/* key — класс же күн алмашканда форманы кайра түзөт */}
      <AttendanceForm key={`${classId}|${date}`} classId={classId} date={date} />
    </>
  );
}

function AttendanceForm({ classId, date }: { classId: string; date: string }) {
  const { data, setAttendance } = useStore();
  const students = studentsOfClass(classId);
  const alreadyMarked = students.some((s) => data.attendance[attendanceKey(date, s.id)]);
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>(() =>
    Object.fromEntries(students.map((s) => [s.id, data.attendance[attendanceKey(date, s.id)] ?? 'present'])),
  );
  const [saved, setSaved] = useState(false);

  const counts = Object.values(draft).reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});

  const save = () => {
    setAttendance(date, draft);
    setSaved(true);
  };

  return (
    <Card>
      {!isSchoolDay(date) && <Notice $tone="warning"><TriangleAlert size={16} /> Тандалган күн — дем алыш күнү.</Notice>}
      {saved && <Notice $tone="success"><CheckCircle2 size={16} /> Катышуу сакталды. Келбей калган окуучулардын ата-энелерине билдирүү жөнөтүлдү.</Notice>}
      {!saved && !alreadyMarked && isSchoolDay(date) && (
        <Notice $tone="info"><CalendarCheck size={16} /> {formatRelative(date)} үчүн катышуу али белгилене элек.</Notice>
      )}

      <CardHead>
        <h3>{classById(classId).name} классы · {formatLong(date)}</h3>
        <Row>
          {(Object.keys(ATTENDANCE_META) as AttendanceStatus[]).map((s) => (
            <Badge key={s} $tone={ATTENDANCE_META[s].tone}>{ATTENDANCE_META[s].label}: {counts[s] ?? 0}</Badge>
          ))}
        </Row>
      </CardHead>

      {students.map((s, i) => (
        <ListItem key={s.id} style={{ alignItems: 'center' }}>
          <Muted style={{ width: 22 }}>{i + 1}</Muted>
          <div className="grow title">{s.name}</div>
          <Row $gap="0.35rem">
            {(Object.keys(ATTENDANCE_META) as AttendanceStatus[]).map((st) => (
              <StatusBtn
                key={st}
                type="button"
                $active={draft[s.id] === st}
                $tone={ATTENDANCE_META[st].tone}
                onClick={() => {
                  setDraft({ ...draft, [s.id]: st });
                  setSaved(false);
                }}
              >
                {ATTENDANCE_META[st].label}
              </StatusBtn>
            ))}
          </Row>
        </ListItem>
      ))}

      <Row $justify="flex-end" style={{ marginTop: '1rem' }}>
        <Button
          $variant="secondary"
          onClick={() => {
            setDraft(Object.fromEntries(students.map((s) => [s.id, 'present'])));
            setSaved(false);
          }}
        >
          Баары келди
        </Button>
        <Button onClick={save}><CheckCircle2 size={16} /> Сактоо</Button>
      </Row>
    </Card>
  );
}

/* ================================================================== */
/*  Үй тапшырмалары                                                   */
/* ================================================================== */

function HomeworkPage({ teacherId }: { teacherId: string }) {
  const { data, addHomework, removeHomework } = useStore();
  const assignments = teacherAssignments(teacherId);
  const [key, setKey] = useState(assignmentKey(assignments[0]));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(addDays(todayISO(), 2));
  const today = todayISO();

  const mine = data.homework
    .filter((h) => h.teacherId === teacherId)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const [classId, subjectId] = key.split(':');
    addHomework({ classId, subjectId, teacherId, title: title.trim(), description: description.trim(), dueDate });
    setTitle('');
    setDescription('');
  };

  return (
    <>
      <PageHeader title="Үй тапшырмалары" subtitle="Тапшырма берүү жана аткарылышын көзөмөлдөө" />
      <Split $ratio="1fr 1.5fr">
        <Card as="form" onSubmit={submit}>
          <CardHead><h3><Plus size={18} /> Жаңы тапшырма</h3></CardHead>
          <Field style={{ marginBottom: '0.9rem' }}>
            Класс жана сабак
            <Select value={key} onChange={(e) => setKey(e.target.value)}>
              {assignments.map((a) => <option key={assignmentKey(a)} value={assignmentKey(a)}>{assignmentLabel(a)}</option>)}
            </Select>
          </Field>
          <Field style={{ marginBottom: '0.9rem' }}>
            Тапшырма
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Мисалы: §14, №120–125" required />
          </Field>
          <Field style={{ marginBottom: '0.9rem' }}>
            Түшүндүрмө
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Кошумча көрсөтмөлөр (милдеттүү эмес)" rows={3} />
          </Field>
          <Field style={{ marginBottom: '1rem' }}>
            Аткаруу мөөнөтү
            <Input type="date" value={dueDate} min={today} onChange={(e) => setDueDate(e.target.value)} required />
          </Field>
          <Button type="submit" style={{ width: '100%' }} disabled={!title.trim()}><Send size={16} /> Окуучуларга жөнөтүү</Button>
        </Card>

        <Card>
          <CardHead>
            <h3>Берилген тапшырмалар</h3>
            <span className="muted">{mine.length} тапшырма</span>
          </CardHead>
          {mine.length === 0 && <EmptyState>Тапшырма жок</EmptyState>}
          {mine.map((h) => {
            const students = studentsOfClass(h.classId);
            const done = students.filter((s) => data.homeworkDone[`${h.id}|${s.id}`]).length;
            const overdue = h.dueDate < today;
            return (
              <ListItem key={h.id}>
                <div className="grow">
                  <Row $gap="0.4rem" style={{ marginBottom: '0.2rem' }}>
                    <Badge $tone="primary">{classById(h.classId).name}</Badge>
                    <Badge $tone="neutral">{subjectById(h.subjectId).name}</Badge>
                    <Badge $tone={overdue ? 'neutral' : 'warning'}>Мөөнөт: {formatRelative(h.dueDate)}</Badge>
                  </Row>
                  <div className="title">{h.title}</div>
                  {h.description && <div className="sub">{h.description}</div>}
                  <div className="sub" style={{ marginTop: '0.3rem' }}>
                    Аткарды: <b>{done} / {students.length}</b>
                  </div>
                </div>
                <Button $variant="ghost" $size="sm" aria-label="Өчүрүү" onClick={() => window.confirm('Тапшырманы өчүрөсүзбү?') && removeHomework(h.id)}>
                  <Trash2 size={16} />
                </Button>
              </ListItem>
            );
          })}
        </Card>
      </Split>
    </>
  );
}

/* ================================================================== */
/*  Отчеттор                                                          */
/* ================================================================== */

function ReportsPage({ teacherId }: { teacherId: string }) {
  const { data, addTeacherReport } = useStore();
  const assignments = teacherAssignments(teacherId);
  const months = recentMonths(3);
  const [key, setKey] = useState(assignmentKey(assignments[0]));
  const [period, setPeriod] = useState(months[1]);
  const [lessonsHeld, setLessonsHeld] = useState(12);
  const [topics, setTopics] = useState('');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  const [classId, subjectId] = key.split(':');
  const metrics = classMetrics(data, classId, subjectId, period);
  const mine = data.teacherReports.filter((r) => r.teacherId === teacherId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    addTeacherReport({ teacherId, classId, subjectId, period, lessonsHeld, topics: topics.trim(), notes: notes.trim(), metrics });
    setTopics('');
    setNotes('');
    setSent(true);
  };

  return (
    <>
      <PageHeader title="Мугалимдин отчеттору" subtitle="Көрсөткүчтөр журналдан автоматтык түрдө эсептелет — кагаз отчет жазуунун кереги жок" />
      <Split $ratio="1.2fr 1fr">
        <Card as="form" onSubmit={submit}>
          <CardHead><h3><FileText size={18} /> Айлык отчет түзүү</h3></CardHead>
          {sent && <Notice $tone="success"><CheckCircle2 size={16} /> Отчет директорго жөнөтүлдү.</Notice>}
          <FormRow>
            <Field>
              Класс жана сабак
              <Select value={key} onChange={(e) => { setKey(e.target.value); setSent(false); }}>
                {assignments.map((a) => <option key={assignmentKey(a)} value={assignmentKey(a)}>{assignmentLabel(a)}</option>)}
              </Select>
            </Field>
            <Field>
              Мезгил
              <Select value={period} onChange={(e) => { setPeriod(e.target.value); setSent(false); }}>
                {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </Select>
            </Field>
            <Field style={{ flex: '0 1 140px' }}>
              Өтүлгөн сабак
              <Input type="number" min={0} max={60} value={lessonsHeld} onChange={(e) => setLessonsHeld(Number(e.target.value))} />
            </Field>
          </FormRow>

          <Grid $min="120px" $gap="0.6rem">
            <MiniMetric label="Орточо баа" value={fmt(metrics.avgGrade, 2)} />
            <MiniMetric label="Билим сапаты" value={pct(metrics.quality)} />
            <MiniMetric label="Жетишүү" value={pct(metrics.success)} />
            <MiniMetric label="Катышуу" value={pct(metrics.attendance)} />
          </Grid>

          <Field style={{ marginBottom: '0.9rem' }}>
            Өтүлгөн темалар
            <Textarea value={topics} onChange={(e) => setTopics(e.target.value)} rows={3} placeholder="Мисалы: Бөлчөктөрдү кошуу жана кемитүү; Пропорциялар" required />
          </Field>
          <Field style={{ marginBottom: '1rem' }}>
            Эскертүүлөр / сунуштар
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Артта калган окуучулар менен иш, кошумча сабактар..." />
          </Field>
          <Button type="submit" style={{ width: '100%' }} disabled={!topics.trim()}><Send size={16} /> Директорго жөнөтүү</Button>
        </Card>

        <Card>
          <CardHead><h3>Менин отчетторум</h3></CardHead>
          {mine.length === 0 && <EmptyState>Азырынча отчет жок</EmptyState>}
          {mine.map((r) => (
            <ListItem key={r.id}>
              <div className="grow">
                <div className="title">{assignmentLabel(r)} · {monthLabel(r.period)}</div>
                <div className="sub">Орточо {fmt(r.metrics.avgGrade, 2)} · сапат {pct(r.metrics.quality)} · катышуу {pct(r.metrics.attendance)}</div>
              </div>
              <Badge $tone={REPORT_STATUS[r.status].tone}>{REPORT_STATUS[r.status].label}</Badge>
            </ListItem>
          ))}
        </Card>
      </Split>
    </>
  );
}
