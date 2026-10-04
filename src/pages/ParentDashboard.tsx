import { useState } from 'react';
import styled from 'styled-components';
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  Clock,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  NotebookPen,
  Phone,
  TrendingUp,
} from 'lucide-react';
import { AppLayout, type NavItem } from '../components/AppLayout';
import {
  Badge,
  BarList,
  Card,
  CardHead,
  EmptyState,
  GradeChip,
  Grid,
  ListItem,
  Muted,
  PageHeader,
  Row,
  Segmented,
  Split,
  StatCard,
  Table,
  TableWrap,
  toneColors,
} from '../components/ui';
import { MessagesPage } from './shared/MessagesPage';
import { useStore } from '../store/context';
import { SCHOOL, SUBJECTS, classById, parentById, studentById, subjectById, teacherById, subjectTeacherId } from '../data/mockData';
import { attendanceKey, classMetrics, filterGrades, studentAttendance, studentAvg } from '../utils/analytics';
import { ATTENDANCE_META } from '../utils/labels';
import { visibleMessages } from '../utils/messages';
import { WEEKDAYS, addDays, formatDateTime, formatRelative, formatShort, isSchoolDay, lastSchoolDay, lastSchoolDays, todayISO, weekday, weekdayShort } from '../utils/date';
import { average, fmt, gradeTone, pct } from '../utils/stats';
import type { AttendanceStatus } from '../types';
import { popIn } from '../styles/animations';

type Section = 'home' | 'grades' | 'attendance' | 'homework' | 'schedule' | 'messages';

export function ParentDashboard() {
  const { session, data } = useStore();
  const parent = parentById(session!.userId)!;
  const [section, setSection] = useState<Section>('home');
  const [childId, setChildId] = useState(parent.childIds[0]);
  const today = todayISO();
  const child = studentById(childId);

  const pendingHw = data.homework.filter(
    (h) => h.classId === child.classId && h.dueDate >= today && !data.homeworkDone[`${h.id}|${childId}`],
  ).length;

  const nav: NavItem<Section>[] = [
    { key: 'home', label: 'Башкы бет', icon: <LayoutDashboard size={19} /> },
    { key: 'grades', label: 'Баалар', icon: <BookOpen size={19} /> },
    { key: 'attendance', label: 'Катышуу', icon: <CalendarCheck size={19} /> },
    { key: 'homework', label: 'Үй тапшырмалары', icon: <NotebookPen size={19} />, badge: pendingHw },
    { key: 'schedule', label: 'Сабак жадыбалы', icon: <CalendarDays size={19} /> },
    { key: 'messages', label: 'Билдирүүлөр', icon: <MessageSquare size={19} /> },
  ];

  const childSwitcher =
    parent.childIds.length > 1 && section !== 'messages' ? (
      <Segmented
        value={childId}
        onChange={setChildId}
        options={parent.childIds.map((id) => {
          const s = studentById(id);
          return { value: id, label: `${s.name.split(' ')[1]} · ${classById(s.classId).name}` };
        })}
      />
    ) : null;

  return (
    <AppLayout nav={nav} active={section} onNavigate={setSection} roleLabel="Ата-эне" userName={parent.name}>
      {childSwitcher && <div style={{ marginBottom: '1rem' }}>{childSwitcher}</div>}
      {section === 'home' && <ParentHome studentId={childId} onNavigate={setSection} />}
      {section === 'grades' && <GradesPage studentId={childId} />}
      {section === 'attendance' && <AttendancePage studentId={childId} />}
      {section === 'homework' && <HomeworkPage studentId={childId} />}
      {section === 'schedule' && <SchedulePage studentId={childId} />}
      {section === 'messages' && <MessagesPage />}
    </AppLayout>
  );
}

/* ================================================================== */

function ParentHome({ studentId, onNavigate }: { studentId: string; onNavigate: (s: Section) => void }) {
  const { data, session } = useStore();
  const student = studentById(studentId);
  const cls = classById(student.classId);
  const homeroom = teacherById(cls.homeroomTeacherId)!;
  const today = todayISO();
  const ids = new Set([studentId]);
  const grades = filterGrades(data, { studentIds: ids }).sort((a, b) => b.date.localeCompare(a.date));
  const avg = average(grades.map((g) => g.value));
  const weekGrades = grades.filter((g) => g.date >= addDays(today, -7));
  const att = studentAttendance(data, studentId);
  const todayStatus = isSchoolDay(today) ? data.attendance[attendanceKey(today, studentId)] : undefined;
  const pendingHw = data.homework.filter((h) => h.classId === student.classId && h.dueDate >= today && !data.homeworkDone[`${h.id}|${studentId}`]);
  const news = visibleMessages(data, session!).filter((m) => m.fromId !== session!.userId).slice(0, 3);

  return (
    <>
      <PageHeader
        title={student.name}
        subtitle={<>{cls.name} классы · {SCHOOL.name} · Класс жетекчи: {homeroom.name}</>}
      />

      <Grid $min="210px">
        <StatCard
          icon={<CircleCheck size={22} />}
          label={isSchoolDay(today) ? 'Бүгүнкү абал' : 'Бүгүн дем алыш'}
          value={todayStatus ? ATTENDANCE_META[todayStatus].label : isSchoolDay(today) ? 'Белгилене элек' : '—'}
          tone={todayStatus ? ATTENDANCE_META[todayStatus].tone : 'neutral'}
          hint={isSchoolDay(today) ? 'Мугалим белгилегенде жаңыланат' : `Акыркы окуу күнү: ${formatShort(lastSchoolDay())}`}
        />
        <StatCard icon={<TrendingUp size={22} />} label="Орточо баа" value={fmt(avg, 2)} tone={gradeTone(avg)} hint={`Бул жумада ${weekGrades.length} жаңы баа`} />
        <StatCard icon={<CalendarCheck size={22} />} label="Катышуу" value={pct(att)} tone="violet" hint="Акыркы 4 жума" />
        <StatCard icon={<NotebookPen size={22} />} label="Аткарыла элек тапшырма" value={pendingHw.length} tone="warning" />
      </Grid>

      <Split>
        <Card>
          <CardHead>
            <h3>Акыркы баалар</h3>
            <a href="#grades" onClick={(e) => { e.preventDefault(); onNavigate('grades'); }} style={{ fontSize: '0.85rem', color: '#1D4ED8' }}>Баарын көрүү →</a>
          </CardHead>
          {grades.length === 0 && <EmptyState>Баа жок</EmptyState>}
          {grades.slice(0, 7).map((g) => (
            <ListItem key={g.id} style={{ alignItems: 'center' }}>
              <GradeChip $value={g.value}>{g.value}</GradeChip>
              <div className="grow">
                <div className="title">{subjectById(g.subjectId).name}</div>
                <div className="sub">{teacherById(g.teacherId)?.name}</div>
              </div>
              <Muted>{formatRelative(g.date)}</Muted>
            </ListItem>
          ))}
        </Card>

        <Card>
          <CardHead><h3><Megaphone size={18} /> Мектептен кабарлар</h3></CardHead>
          {news.length === 0 && <EmptyState>Кабар жок</EmptyState>}
          {news.map((m) => (
            <ListItem key={m.id}>
              <div className="grow">
                <div className="title">{m.fromName}</div>
                <div className="sub">{formatDateTime(m.createdAt)}</div>
                <div style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>{m.text}</div>
              </div>
            </ListItem>
          ))}
        </Card>
      </Split>

      <Split $ratio="1fr 1fr">
        <Card>
          <CardHead><h3>Сабактар боюнча орточо баа</h3></CardHead>
          <BarList
            items={cls.subjectIds.map((sid) => {
              const v = studentAvg(data, studentId, sid);
              return { label: subjectById(sid).name, value: v, max: 5, display: fmt(v, 1), tone: gradeTone(v) };
            })}
          />
        </Card>
        <Card>
          <CardHead><h3><Phone size={18} /> Байланыш</h3></CardHead>
          <ListItem>
            <div className="grow">
              <div className="title">{homeroom.name}</div>
              <div className="sub">Класс жетекчи · {homeroom.phone}</div>
            </div>
          </ListItem>
          {[...new Set(cls.subjectIds.map(subjectTeacherId))]
            .filter((tid) => tid !== homeroom.id)
            .map((tid) => {
              const t = teacherById(tid)!;
              const subjects = t.subjectIds.filter((s) => cls.subjectIds.includes(s)).map((s) => subjectById(s).name);
              return (
                <ListItem key={tid}>
                  <div className="grow">
                    <div className="title">{t.name}</div>
                    <div className="sub">{subjects.join(', ')} · {t.phone}</div>
                  </div>
                </ListItem>
              );
            })}
        </Card>
      </Split>
    </>
  );
}

/* ================================================================== */

function GradesPage({ studentId }: { studentId: string }) {
  const { data } = useStore();
  const student = studentById(studentId);
  const cls = classById(student.classId);
  return (
    <>
      <PageHeader title="Баалар" subtitle={`${student.name} · ${cls.name} классы · электрондук журналдан`} />
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Сабак</th>
                <th>Баалар (эскиден жаңыга)</th>
                <th className="center">Орточо</th>
                <th className="center">Класстын орточосу</th>
              </tr>
            </thead>
            <tbody>
              {cls.subjectIds.map((sid) => {
                const grades = filterGrades(data, { studentIds: new Set([studentId]), subjectId: sid }).sort((a, b) => a.date.localeCompare(b.date));
                const avg = average(grades.map((g) => g.value));
                const classAvg = classMetrics(data, cls.id, sid).avgGrade;
                return (
                  <tr key={sid}>
                    <td style={{ fontWeight: 600 }}>
                      {subjectById(sid).name}
                      <div><Muted>{teacherById(subjectTeacherId(sid))?.name}</Muted></div>
                    </td>
                    <td>
                      <Row $gap="0.3rem" $wrap={false}>
                        {grades.length === 0 && <Muted>—</Muted>}
                        {grades.map((g) => (
                          <GradeChip key={g.id} $value={g.value} title={formatShort(g.date)}>{g.value}</GradeChip>
                        ))}
                      </Row>
                    </td>
                    <td className="center"><Badge $tone={gradeTone(avg)}>{fmt(avg, 2)}</Badge></td>
                    <td className="center"><Muted>{fmt(classAvg, 2)}</Muted></td>
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

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 0.5rem;
`;

const Day = styled.div<{ $status?: AttendanceStatus }>`
  border-radius: 10px;
  padding: 0.5rem 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  animation: ${popIn} 0.4s ease both;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-3px) scale(1.05);
  }
  ${({ theme, $status }) => {
    const t = toneColors(theme, $status ? ATTENDANCE_META[$status].tone : 'neutral');
    return `background: ${t.bg}; color: ${t.fg}; border: 1px solid ${$status ? 'transparent' : theme.colors.border};`;
  }}
  b {
    display: block;
    font-size: 1rem;
  }
`;

function AttendancePage({ studentId }: { studentId: string }) {
  const { data } = useStore();
  const student = studentById(studentId);
  const days = lastSchoolDays(20, todayISO());
  const statuses = days.map((d) => data.attendance[attendanceKey(d, studentId)]);
  const count = (s: AttendanceStatus) => statuses.filter((x) => x === s).length;
  const missed = days.filter((d) => {
    const s = data.attendance[attendanceKey(d, studentId)];
    return s && s !== 'present';
  });

  return (
    <>
      <PageHeader title="Катышуу" subtitle={`${student.name} · акыркы 20 окуу күнү`} />
      <Grid $min="160px">
        {(Object.keys(ATTENDANCE_META) as AttendanceStatus[]).map((s) => (
          <StatCard key={s} icon={<CalendarCheck size={20} />} label={ATTENDANCE_META[s].label} value={count(s)} tone={ATTENDANCE_META[s].tone} hint="күн" />
        ))}
      </Grid>
      <Split $ratio="1.5fr 1fr">
        <Card>
          <CardHead>
            <h3>Календарь</h3>
            <Row>
              {(Object.keys(ATTENDANCE_META) as AttendanceStatus[]).map((s) => (
                <Badge key={s} $tone={ATTENDANCE_META[s].tone}>{ATTENDANCE_META[s].short} — {ATTENDANCE_META[s].label}</Badge>
              ))}
            </Row>
          </CardHead>
          <DayGrid>
            {days.map((d, i) => (
              <Day key={d} style={{ animationDelay: `${i * 30}ms` }} $status={statuses[i]} title={statuses[i] ? ATTENDANCE_META[statuses[i]].label : 'Белгилене элек'}>
                {weekdayShort(d)}
                <b>{statuses[i] ? ATTENDANCE_META[statuses[i]].short : '·'}</b>
                {formatShort(d)}
              </Day>
            ))}
          </DayGrid>
        </Card>
        <Card>
          <CardHead><h3>Калтырылган / кечиккен күндөр</h3></CardHead>
          {missed.length === 0 && <EmptyState>Бир дагы сабак калтырылган эмес 👏</EmptyState>}
          {[...missed].reverse().map((d) => {
            const s = data.attendance[attendanceKey(d, studentId)];
            return (
              <ListItem key={d} style={{ alignItems: 'center' }}>
                <div className="grow title">{formatShort(d)}, {WEEKDAYS[weekday(d) - 1]}</div>
                <Badge $tone={ATTENDANCE_META[s].tone}>{ATTENDANCE_META[s].label}</Badge>
              </ListItem>
            );
          })}
        </Card>
      </Split>
    </>
  );
}

/* ================================================================== */

const Check = styled.input`
  width: 20px;
  height: 20px;
  accent-color: ${({ theme }) => theme.colors.success};
  cursor: pointer;
  margin-top: 2px;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  &:checked {
    transform: scale(1.15);
  }
`;

function HomeworkPage({ studentId }: { studentId: string }) {
  const { data, toggleHomeworkDone } = useStore();
  const student = studentById(studentId);
  const today = todayISO();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const list = data.homework
    .filter((h) => h.classId === student.classId && (tab === 'active' ? h.dueDate >= today : h.dueDate < today))
    .sort((a, b) => (tab === 'active' ? a.dueDate.localeCompare(b.dueDate) : b.dueDate.localeCompare(a.dueDate)));

  return (
    <>
      <PageHeader
        title="Үй тапшырмалары"
        subtitle={`${student.name} · баланын аткарганын белгилеп коюңуз — мугалим көрөт`}
        actions={<Segmented value={tab} onChange={setTab} options={[{ value: 'active', label: 'Учурдагы' }, { value: 'past', label: 'Мөөнөтү өткөн' }]} />}
      />
      <Card>
        {list.length === 0 && <EmptyState>Тапшырма жок</EmptyState>}
        {list.map((h) => {
          const done = !!data.homeworkDone[`${h.id}|${studentId}`];
          return (
            <ListItem key={h.id}>
              <Check type="checkbox" checked={done} onChange={() => toggleHomeworkDone(h.id, studentId)} aria-label="Аткарылды" />
              <div className="grow">
                <Row $gap="0.4rem" style={{ marginBottom: '0.2rem' }}>
                  <Badge $tone="primary">{subjectById(h.subjectId).name}</Badge>
                  <Badge $tone={done ? 'success' : h.dueDate < today ? 'danger' : 'warning'}>
                    {done ? 'Аткарылды' : <><Clock size={12} /> {formatRelative(h.dueDate)}</>}
                  </Badge>
                </Row>
                <div className="title" style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1, transition: 'opacity 0.3s' }}>{h.title}</div>
                <div className="sub">{h.description} · {teacherById(h.teacherId)?.name}</div>
              </div>
            </ListItem>
          );
        })}
      </Card>
    </>
  );
}

/* ================================================================== */

const TIMES = ['08:00–08:45', '08:55–09:40', '09:50–10:35', '10:55–11:40', '11:50–12:35', '12:45–13:30'];

const DayCol = styled(Card)<{ $today: boolean }>`
  border-color: ${({ $today, theme }) => ($today ? theme.colors.primary : theme.colors.border)};
  box-shadow: ${({ $today, theme }) => ($today ? `0 0 0 3px ${theme.colors.primarySoft}` : theme.shadow.sm)};
`;

function SchedulePage({ studentId }: { studentId: string }) {
  const student = studentById(studentId);
  const cls = classById(student.classId);
  const todayW = new Date().getDay();
  const order = SUBJECTS.map((s) => s.id);
  return (
    <>
      <PageHeader title="Сабак жадыбалы" subtitle={`${cls.name} классы · жумалык жүгүртмө`} />
      <Grid $min="200px">
        {[1, 2, 3, 4, 5].map((w) => {
          const subjects = cls.subjectIds
            .filter((sid) => subjectById(sid).weekdays.includes(w))
            .sort((a, b) => order.indexOf(a) - order.indexOf(b));
          return (
            <DayCol key={w} $today={w === todayW}>
              <CardHead>
                <h3>{WEEKDAYS[w - 1]}</h3>
                {w === todayW && <Badge $tone="primary">Бүгүн</Badge>}
              </CardHead>
              {subjects.map((sid, i) => (
                <ListItem key={sid}>
                  <Muted style={{ width: 18 }}>{i + 1}</Muted>
                  <div className="grow">
                    <div className="title">{subjectById(sid).name}</div>
                    <div className="sub">{TIMES[i]} · {teacherById(subjectTeacherId(sid))?.name.split(' ').slice(0, 2).join(' ')}</div>
                  </div>
                </ListItem>
              ))}
            </DayCol>
          );
        })}
      </Grid>
    </>
  );
}
