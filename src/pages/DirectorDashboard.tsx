import { useState } from 'react';
import {
  Award,
  BookOpen,
  CalendarCheck,
  Check,
  CircleCheck,
  Download,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  RotateCcw,
  School,
  Send,
  TrendingUp,
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
  Grid,
  ListItem,
  MiniMetric,
  Muted,
  Notice,
  PageHeader,
  Row,
  Segmented,
  Select,
  Split,
  StatCard,
  Table,
  TableWrap,
  Textarea,
} from '../components/ui';
import { MessagesPage } from './shared/MessagesPage';
import { useStore } from '../store/context';
import {
  CLASSES,
  DIRECTOR,
  SCHOOL,
  STUDENTS,
  SUBJECTS,
  TEACHERS,
  classById,
  parentById,
  studentsOfClass,
  subjectById,
  teacherAssignments,
  teacherById,
} from '../data/mockData';
import { atRiskStudents, attendanceKey, classMetrics, filterGrades, schoolMetrics, studentAttendance, studentAvg } from '../utils/analytics';
import { REPORT_STATUS } from '../utils/labels';
import { addDays, formatDateTime, formatLong, isSchoolDay, lastSchoolDay, monthLabel, recentMonths, todayISO } from '../utils/date';
import { average, downloadCSV, fmt, gradeTone, pct } from '../utils/stats';

type Section = 'home' | 'classes' | 'teachers' | 'reports' | 'messages';

export function DirectorDashboard() {
  const { data } = useStore();
  const [section, setSection] = useState<Section>('home');
  const pending = data.teacherReports.filter((r) => r.status === 'submitted').length;

  const nav: NavItem<Section>[] = [
    { key: 'home', label: 'Башкы панель', icon: <LayoutDashboard size={19} /> },
    { key: 'classes', label: 'Класстар жана окуучулар', icon: <Users size={19} /> },
    { key: 'teachers', label: 'Мугалимдер', icon: <GraduationCap size={19} /> },
    { key: 'reports', label: 'Отчеттуулук', icon: <FileText size={19} />, badge: pending },
    { key: 'messages', label: 'Билдирүүлөр', icon: <MessageSquare size={19} /> },
  ];

  return (
    <AppLayout nav={nav} active={section} onNavigate={setSection} roleLabel="Мектеп директору" userName={DIRECTOR.name}>
      {section === 'home' && <DirectorHome onNavigate={setSection} />}
      {section === 'classes' && <ClassesPage />}
      {section === 'teachers' && <TeachersPage />}
      {section === 'reports' && <ReportsPage />}
      {section === 'messages' && <MessagesPage />}
    </AppLayout>
  );
}

/* ================================================================== */

function DirectorHome({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const { data } = useStore();
  const m = schoolMetrics(data);
  const today = todayISO();
  const day = isSchoolDay(today) ? today : lastSchoolDay(today);
  const markedClasses = CLASSES.filter((c) => studentsOfClass(c.id).every((s) => data.attendance[attendanceKey(day, s.id)]));
  const presentToday = STUDENTS.filter((s) => {
    const st = data.attendance[attendanceKey(day, s.id)];
    return st === 'present' || st === 'late';
  }).length;
  const risk = atRiskStudents(data);
  const pending = data.teacherReports.filter((r) => r.status === 'submitted');
  const weekGrades = filterGrades(data, {}).filter((g) => g.date >= addDays(today, -7)).length;

  return (
    <>
      <PageHeader
        title={SCHOOL.name}
        subtitle={`${SCHOOL.village}, ${SCHOOL.district}, ${SCHOOL.region} · ${formatLong(today)}`}
        actions={<Button onClick={() => onNavigate('reports')}><Landmark size={16} /> Районго отчет</Button>}
      />

      <Grid $min="200px">
        <StatCard icon={<Users size={22} />} label="Окуучулар" value={STUDENTS.length} hint={`${CLASSES.length} класс`} />
        <StatCard icon={<GraduationCap size={22} />} label="Мугалимдер" value={TEACHERS.length} tone="info" hint={`Жумада ${weekGrades} баа коюлду`} />
        <StatCard icon={<Award size={22} />} label="Орточо баа" value={fmt(m.avgGrade, 2)} tone={gradeTone(m.avgGrade)} hint={`Билим сапаты ${pct(m.quality)}`} />
        <StatCard icon={<TrendingUp size={22} />} label="Катышуу" value={pct(m.attendance)} tone="violet" hint={`Жетишүү ${pct(m.success)}`} />
      </Grid>

      {pending.length > 0 && (
        <Notice $tone="warning">
          <FileText size={16} />
          <span>
            {pending.length} мугалимдин отчету бекитүүнү күтүүдө.{' '}
            <a href="#reports" onClick={(e) => { e.preventDefault(); onNavigate('reports'); }}><b>Карап чыгуу →</b></a>
          </span>
        </Notice>
      )}

      <Split>
        <Card>
          <CardHead>
            <h3><CalendarCheck size={18} /> {day === today ? 'Бүгүнкү' : 'Акыркы окуу күнүнүн'} катышуусу</h3>
            <span className="muted">{markedClasses.length}/{CLASSES.length} класс белгиленди</span>
          </CardHead>
          {CLASSES.map((c) => {
            const students = studentsOfClass(c.id);
            const marked = students.filter((s) => data.attendance[attendanceKey(day, s.id)]);
            const present = marked.filter((s) => ['present', 'late'].includes(data.attendance[attendanceKey(day, s.id)])).length;
            return (
              <ListItem key={c.id} style={{ alignItems: 'center' }}>
                <Badge $tone="primary">{c.name}</Badge>
                <div className="grow">
                  <div className="sub">Класс жетекчи: {teacherById(c.homeroomTeacherId)?.name}</div>
                </div>
                {marked.length === 0 ? (
                  <Badge $tone="warning">Белгилене элек</Badge>
                ) : (
                  <Badge $tone={present === students.length ? 'success' : 'info'}>{present}/{students.length} келди</Badge>
                )}
              </ListItem>
            );
          })}
          <Muted style={{ display: 'block', marginTop: '0.75rem' }}>Жалпы келгендер: {presentToday} окуучу</Muted>
        </Card>

        <Card>
          <CardHead>
            <h3><TriangleAlert size={18} color="#D97706" /> Эрте эскертүү</h3>
            <span className="muted">{risk.length} окуучу</span>
          </CardHead>
          {risk.length === 0 && <EmptyState>Тобокелдикте окуучу жок</EmptyState>}
          {risk.slice(0, 6).map((r) => (
            <ListItem key={r.student.id}>
              <div className="grow">
                <div className="title">{r.student.name}</div>
                <div className="sub">{classById(r.student.classId).name} · {r.reasons.join(', ')} · катышуу {pct(r.attendance)}</div>
              </div>
              <Badge $tone={gradeTone(r.avg)}>{fmt(r.avg, 1)}</Badge>
            </ListItem>
          ))}
        </Card>
      </Split>

      <Split $ratio="1fr 1fr">
        <Card>
          <CardHead><h3>Класстар боюнча билим сапаты</h3></CardHead>
          <BarList
            items={CLASSES.map((c) => {
              const cm = classMetrics(data, c.id);
              return { label: `${c.name} (орт. ${fmt(cm.avgGrade, 2)})`, value: cm.quality, max: 100, display: pct(cm.quality), tone: 'success' };
            })}
          />
          <CardHead style={{ marginTop: '1.25rem' }}><h3>Класстар боюнча катышуу</h3></CardHead>
          <BarList
            items={CLASSES.map((c) => {
              const cm = classMetrics(data, c.id);
              return { label: c.name, value: cm.attendance, max: 100, display: pct(cm.attendance), tone: 'violet' };
            })}
          />
        </Card>
        <Card>
          <CardHead><h3>Сабактар боюнча орточо баа</h3></CardHead>
          <BarList
            items={SUBJECTS.map((s) => {
              const v = average(filterGrades(data, { subjectId: s.id }).map((g) => g.value));
              return { label: s.name, value: v, max: 5, display: fmt(v, 2), tone: gradeTone(v) };
            }).sort((a, b) => b.value - a.value)}
          />
        </Card>
      </Split>
    </>
  );
}

/* ================================================================== */

function ClassesPage() {
  const { data } = useStore();
  const [classId, setClassId] = useState(CLASSES[0].id);
  const cls = classById(classId);
  const m = classMetrics(data, classId);
  const students = studentsOfClass(classId)
    .map((s) => ({ s, avg: studentAvg(data, s.id), att: studentAttendance(data, s.id) }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <>
      <PageHeader
        title="Класстар жана окуучулар"
        subtitle={`Класс жетекчи: ${teacherById(cls.homeroomTeacherId)?.name}`}
        actions={<Segmented value={classId} onChange={setClassId} options={CLASSES.map((c) => ({ value: c.id, label: c.name }))} />}
      />
      <Grid $min="170px">
        <StatCard icon={<Users size={20} />} label="Окуучулар" value={students.length} />
        <StatCard icon={<Award size={20} />} label="Орточо баа" value={fmt(m.avgGrade, 2)} tone={gradeTone(m.avgGrade)} />
        <StatCard icon={<CircleCheck size={20} />} label="Билим сапаты" value={pct(m.quality)} tone="success" />
        <StatCard icon={<CalendarCheck size={20} />} label="Катышуу" value={pct(m.attendance)} tone="violet" />
      </Grid>
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>№</th>
                <th>Окуучу</th>
                <th>Ата-эне</th>
                <th className="center">Орточо баа</th>
                <th className="center">Катышуу</th>
                <th>Абалы</th>
              </tr>
            </thead>
            <tbody>
              {students.map(({ s, avg, att }, i) => {
                const p = parentById(s.parentId);
                const risk = avg < 3.3 || att < 88;
                return (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{p?.name}<div><Muted>{p?.phone}</Muted></div></td>
                    <td className="center"><Badge $tone={gradeTone(avg)}>{fmt(avg, 2)}</Badge></td>
                    <td className="center">{pct(att)}</td>
                    <td>{risk ? <Badge $tone="warning">Көзөмөлдө</Badge> : avg >= 4.5 ? <Badge $tone="success">Мыкты</Badge> : <Badge $tone="neutral">Жакшы</Badge>}</td>
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

function TeachersPage() {
  const { data } = useStore();
  const since = addDays(todayISO(), -30);
  return (
    <>
      <PageHeader title="Мугалимдер" subtitle="Электрондук журналды толтуруу активдүүлүгү жана отчеттор" />
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Мугалим</th>
                <th>Сабактар</th>
                <th>Класстар</th>
                <th className="center">30 күндө баа</th>
                <th className="center">Орточо</th>
                <th className="center">Үй тапш.</th>
                <th>Акыркы отчет</th>
              </tr>
            </thead>
            <tbody>
              {TEACHERS.map((t) => {
                const grades = filterGrades(data, { teacherId: t.id }).filter((g) => g.date >= since);
                const avg = average(grades.map((g) => g.value));
                const classes = [...new Set(teacherAssignments(t.id).map((a) => classById(a.classId).name))];
                const lastReport = data.teacherReports.find((r) => r.teacherId === t.id);
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.name}<div><Muted>{t.phone}</Muted></div></td>
                    <td>{t.subjectIds.map((s) => subjectById(s).name).join(', ')}</td>
                    <td>{classes.join(', ')}</td>
                    <td className="center">{grades.length}</td>
                    <td className="center"><Badge $tone={gradeTone(avg)}>{fmt(avg, 2)}</Badge></td>
                    <td className="center">{data.homework.filter((h) => h.teacherId === t.id).length}</td>
                    <td>
                      {lastReport ? (
                        <Badge $tone={REPORT_STATUS[lastReport.status].tone}>{monthLabel(lastReport.period)} · {REPORT_STATUS[lastReport.status].label}</Badge>
                      ) : (
                        <Muted>Тапшырыла элек</Muted>
                      )}
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

function ReportsPage() {
  const { data, setTeacherReportStatus, addSchoolReport } = useStore();
  const months = recentMonths(3);
  const [period, setPeriod] = useState(months[1]);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const metrics = schoolMetrics(data, period);
  const history = data.schoolReports.filter((r) => r.schoolId === SCHOOL.id);

  const send = () => {
    addSchoolReport({
      schoolId: SCHOOL.id,
      schoolName: SCHOOL.name,
      period,
      students: STUDENTS.length,
      teachers: TEACHERS.length,
      metrics,
      note: note.trim() || 'Айлык отчет Akylman.kg аркылуу автоматтык түрдө түзүлдү.',
    });
    setNote('');
    setSent(true);
  };

  const exportCSV = () => {
    const rows: (string | number)[][] = [
      [SCHOOL.name, `${SCHOOL.district}, ${SCHOOL.region}`],
      ['Мезгил', monthLabel(period)],
      [],
      ['Класс', 'Окуучулар', 'Орточо баа', 'Билим сапаты %', 'Жетишүү %', 'Катышуу %', 'Баалар саны'],
      ...CLASSES.map((c) => {
        const cm = classMetrics(data, c.id, undefined, period);
        return [c.name, studentsOfClass(c.id).length, cm.avgGrade, cm.quality, cm.success, cm.attendance, cm.gradesCount];
      }),
      ['Жалпы мектеп', STUDENTS.length, metrics.avgGrade, metrics.quality, metrics.success, metrics.attendance, metrics.gradesCount],
      [],
      ['Сабак', 'Орточо баа', 'Билим сапаты %'],
      ...SUBJECTS.map((s) => {
        const vals = filterGrades(data, { subjectId: s.id, month: period }).map((g) => g.value);
        return [s.name, fmt(average(vals), 2), vals.length ? ((vals.filter((v) => v >= 4).length / vals.length) * 100).toFixed(1) : '—'];
      }),
    ];
    downloadCSV(`akylman_${SCHOOL.id}_${period}.csv`, rows);
  };

  return (
    <>
      <PageHeader title="Отчеттуулук" subtitle="Мугалимдердин отчеттору жана райондук билим берүү бөлүмүнө автоматтык отчет" />

      <Split $ratio="1fr 1fr">
        <Card>
          <CardHead>
            <h3><Landmark size={18} /> Райондук бөлүмгө айлык отчет</h3>
            <Select value={period} onChange={(e) => { setPeriod(e.target.value); setSent(false); }} style={{ width: 'auto' }}>
              {months.map((mo) => <option key={mo} value={mo}>{monthLabel(mo)}</option>)}
            </Select>
          </CardHead>
          {sent && <Notice $tone="success"><CircleCheck size={16} /> Отчет {SCHOOL.district}нун билим берүү бөлүмүнө жөнөтүлдү.</Notice>}
          <Grid $min="120px" $gap="0.6rem">
            <MiniMetric label="Окуучулар" value={String(STUDENTS.length)} />
            <MiniMetric label="Орточо баа" value={fmt(metrics.avgGrade, 2)} />
            <MiniMetric label="Билим сапаты" value={pct(metrics.quality)} />
            <MiniMetric label="Жетишүү" value={pct(metrics.success)} />
            <MiniMetric label="Катышуу" value={pct(metrics.attendance)} />
            <MiniMetric label="Коюлган баалар" value={String(metrics.gradesCount)} />
          </Grid>
          <Field style={{ marginBottom: '1rem' }}>
            Директордун эскертүүсү
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Мисалы: 11-А классында олимпиадага даярдык күчөтүлдү..." />
          </Field>
          <Row $justify="flex-end">
            <Button $variant="secondary" onClick={exportCSV}><Download size={16} /> Excel (CSV)</Button>
            <Button onClick={send}><Send size={16} /> Районго жөнөтүү</Button>
          </Row>
        </Card>

        <Card>
          <CardHead><h3><School size={18} /> Жөнөтүлгөн отчеттор</h3></CardHead>
          {history.length === 0 && <EmptyState>Районго азырынча отчет жөнөтүлө элек</EmptyState>}
          {history.map((r) => (
            <ListItem key={r.id}>
              <div className="grow">
                <div className="title">{monthLabel(r.period)}</div>
                <div className="sub">Орточо {fmt(r.metrics.avgGrade, 2)} · сапат {pct(r.metrics.quality)} · катышуу {pct(r.metrics.attendance)}</div>
              </div>
              <Muted>{formatDateTime(r.createdAt)}</Muted>
            </ListItem>
          ))}
        </Card>
      </Split>

      <Card>
        <CardHead>
          <h3><BookOpen size={18} /> Мугалимдердин отчеттору</h3>
          <span className="muted">{data.teacherReports.length} отчет</span>
        </CardHead>
        {data.teacherReports.length === 0 && <EmptyState>Отчет жок</EmptyState>}
        {data.teacherReports.length > 0 && (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Мугалим</th>
                  <th>Класс / сабак</th>
                  <th>Мезгил</th>
                  <th className="center">Сабак</th>
                  <th className="center">Орточо</th>
                  <th className="center">Сапат</th>
                  <th>Абалы</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.teacherReports.map((r) => (
                  <tr key={r.id}>
                    <td className="wrap" title={r.notes}>
                      <b>{teacherById(r.teacherId)?.name}</b>
                      <div><Muted>{r.topics}</Muted></div>
                    </td>
                    <td>{classById(r.classId).name} · {subjectById(r.subjectId).name}</td>
                    <td>{monthLabel(r.period)}</td>
                    <td className="center">{r.lessonsHeld}</td>
                    <td className="center"><Badge $tone={gradeTone(r.metrics.avgGrade)}>{fmt(r.metrics.avgGrade, 2)}</Badge></td>
                    <td className="center">{pct(r.metrics.quality)}</td>
                    <td><Badge $tone={REPORT_STATUS[r.status].tone}>{REPORT_STATUS[r.status].label}</Badge></td>
                    <td>
                      {r.status === 'submitted' && (
                        <Row $wrap={false} $gap="0.35rem">
                          <Button $size="sm" $variant="success" onClick={() => setTeacherReportStatus(r.id, 'approved')}><Check size={14} /> Бекитүү</Button>
                          <Button $size="sm" $variant="danger" onClick={() => setTeacherReportStatus(r.id, 'returned')}><RotateCcw size={14} /></Button>
                        </Row>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
