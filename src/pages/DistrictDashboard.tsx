import { useState } from 'react';
import {
  Award,
  CalendarCheck,
  Download,
  FileText,
  LayoutDashboard,
  Radio,
  School,
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
  Grid,
  ListItem,
  Muted,
  PageHeader,
  Split,
  StatCard,
  Table,
  TableWrap,
  type Tone,
} from '../components/ui';
import { useStore } from '../store/context';
import { DISTRICT_SCHOOLS, DISTRICT_USER, SCHOOL, STUDENTS, TEACHERS } from '../data/mockData';
import { schoolMetrics } from '../utils/analytics';
import { formatDateTime, monthLabel, recentMonths, todayISO, formatLong } from '../utils/date';
import { downloadCSV, fmt, gradeTone, pct } from '../utils/stats';
import type { AppData, DistrictSchool } from '../types';

type Section = 'home' | 'schools' | 'reports';

const STATUS: Record<DistrictSchool['status'], { label: string; tone: Tone }> = {
  active: { label: 'Туташкан', tone: 'success' },
  pilot: { label: 'Пилот', tone: 'info' },
  connecting: { label: 'Туташууда', tone: 'neutral' },
};

function allSchools(data: AppData): DistrictSchool[] {
  const m = schoolMetrics(data);
  const live: DistrictSchool = {
    id: SCHOOL.id,
    name: SCHOOL.name,
    village: SCHOOL.village,
    students: STUDENTS.length,
    teachers: TEACHERS.length,
    avgGrade: m.avgGrade,
    quality: m.quality,
    attendance: m.attendance,
    status: 'active',
    live: true,
  };
  return [live, ...DISTRICT_SCHOOLS];
}

export function DistrictDashboard() {
  const { data } = useStore();
  const [section, setSection] = useState<Section>('home');
  const month = recentMonths(2)[1];
  const newReports = data.schoolReports.filter((r) => r.period === month).length;

  const nav: NavItem<Section>[] = [
    { key: 'home', label: 'Райондук көрсөткүчтөр', icon: <LayoutDashboard size={19} /> },
    { key: 'schools', label: 'Мектептер', icon: <School size={19} /> },
    { key: 'reports', label: 'Келген отчеттор', icon: <FileText size={19} />, badge: newReports },
  ];

  return (
    <AppLayout nav={nav} active={section} onNavigate={setSection} roleLabel={DISTRICT_USER.office} userName={DISTRICT_USER.name} org={`${SCHOOL.region} · ${DISTRICT_SCHOOLS.length + 1} мектеп`}>
      {section === 'home' && <DistrictHome />}
      {section === 'schools' && <SchoolsPage />}
      {section === 'reports' && <ReportsPage />}
    </AppLayout>
  );
}

/* ================================================================== */

function DistrictHome() {
  const { data } = useStore();
  const schools = allSchools(data);
  const withData = schools.filter((s) => s.avgGrade > 0);
  const totalStudents = schools.reduce((n, s) => n + s.students, 0);
  const weighted = (key: 'avgGrade' | 'quality' | 'attendance') =>
    withData.reduce((n, s) => n + s[key] * s.students, 0) / withData.reduce((n, s) => n + s.students, 0);
  const connected = schools.filter((s) => s.status !== 'connecting').length;

  return (
    <>
      <PageHeader title={DISTRICT_USER.office} subtitle={`${SCHOOL.region} · ${formatLong(todayISO())} · реалдуу убакыттагы маалымат`} />
      <Grid $min="200px">
        <StatCard icon={<School size={22} />} label="Санариптештирилген мектептер" value={`${connected} / ${schools.length}`} hint={`${pct((connected / schools.length) * 100)} камтылды`} />
        <StatCard icon={<Users size={22} />} label="Окуучулар (системада)" value={totalStudents.toLocaleString('ru-RU')} tone="info" />
        <StatCard icon={<Award size={22} />} label="Райондук орточо баа" value={fmt(weighted('avgGrade'), 2)} tone="success" hint={`Билим сапаты ${pct(weighted('quality'))}`} />
        <StatCard icon={<CalendarCheck size={22} />} label="Орточо катышуу" value={pct(weighted('attendance'))} tone="violet" />
      </Grid>

      <Split $ratio="1fr 1fr">
        <Card>
          <CardHead><h3>Мектептердин рейтинги — билим сапаты</h3></CardHead>
          <BarList
            items={withData
              .map((s) => ({ label: s.name, value: s.quality, max: 100, display: pct(s.quality), tone: (s.live ? 'primary' : 'success') as Tone }))
              .sort((a, b) => b.value - a.value)}
          />
          <Muted style={{ display: 'block', marginTop: '0.75rem' }}>Көк түс — Akylman.kg'де жандуу иштеп жаткан демо-мектеп</Muted>
        </Card>
        <Card>
          <CardHead><h3>Катышуу боюнча</h3></CardHead>
          <BarList
            items={withData
              .map((s) => ({ label: s.name, value: s.attendance, max: 100, display: pct(s.attendance), tone: (s.attendance < 92 ? 'warning' : 'violet') as Tone }))
              .sort((a, b) => b.value - a.value)}
          />
        </Card>
      </Split>

      <Card>
        <CardHead><h3><Radio size={18} /> Санариптештирүү абалы</h3></CardHead>
        {schools.map((s) => (
          <ListItem key={s.id} style={{ alignItems: 'center' }}>
            <div className="grow">
              <div className="title">{s.name} {s.live && <Badge $tone="primary">LIVE</Badge>}</div>
              <div className="sub">{s.village} · {s.students} окуучу · {s.teachers} мугалим</div>
            </div>
            <Badge $tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
          </ListItem>
        ))}
      </Card>
    </>
  );
}

/* ================================================================== */

function SchoolsPage() {
  const { data } = useStore();
  const schools = allSchools(data);

  const exportCSV = () =>
    downloadCSV(`akylman_district_${todayISO()}.csv`, [
      ['Мектеп', 'Айыл', 'Абалы', 'Окуучулар', 'Мугалимдер', 'Орточо баа', 'Билим сапаты %', 'Катышуу %'],
      ...schools.map((s) => [s.name, s.village, STATUS[s.status].label, s.students, s.teachers, s.avgGrade || '—', s.quality || '—', s.attendance || '—']),
    ]);

  return (
    <>
      <PageHeader
        title="Райондун мектептери"
        subtitle="Бардык мектептердин көрсөткүчтөрү бир таблицада"
        actions={<Button $variant="secondary" onClick={exportCSV}><Download size={16} /> Excel (CSV)</Button>}
      />
      <Card>
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Мектеп</th>
                <th>Абалы</th>
                <th className="center">Окуучулар</th>
                <th className="center">Мугалимдер</th>
                <th className="center">Орточо баа</th>
                <th className="center">Сапат</th>
                <th className="center">Катышуу</th>
                <th>Акыркы отчет</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => {
                const last = data.schoolReports.find((r) => r.schoolId === s.id);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>
                      {s.name} {s.live && <Badge $tone="primary">LIVE</Badge>}
                      <div><Muted>{s.village}</Muted></div>
                    </td>
                    <td><Badge $tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge></td>
                    <td className="center">{s.students}</td>
                    <td className="center">{s.teachers}</td>
                    <td className="center"><Badge $tone={gradeTone(s.avgGrade)}>{fmt(s.avgGrade, 2)}</Badge></td>
                    <td className="center">{pct(s.quality)}</td>
                    <td className="center">{pct(s.attendance)}</td>
                    <td>{last ? monthLabel(last.period) : <Muted>—</Muted>}</td>
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
  const { data } = useStore();
  const reports = [...data.schoolReports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <>
      <PageHeader title="Келген отчеттор" subtitle="Мектептер Akylman.kg аркылуу жөнөткөн айлык отчеттор — кагазсыз" />
      <Card>
        {reports.length === 0 && <EmptyState>Отчет жок</EmptyState>}
        {reports.length > 0 && (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <th>Мектеп</th>
                  <th>Мезгил</th>
                  <th className="center">Окуучулар</th>
                  <th className="center">Орточо</th>
                  <th className="center">Сапат</th>
                  <th className="center">Жетишүү</th>
                  <th className="center">Катышуу</th>
                  <th>Эскертүү</th>
                  <th>Келген убакыт</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.schoolName} {r.schoolId === SCHOOL.id && <Badge $tone="primary">LIVE</Badge>}</td>
                    <td>{monthLabel(r.period)}</td>
                    <td className="center">{r.students}</td>
                    <td className="center"><Badge $tone={gradeTone(r.metrics.avgGrade)}>{fmt(r.metrics.avgGrade, 2)}</Badge></td>
                    <td className="center">{pct(r.metrics.quality)}</td>
                    <td className="center">{pct(r.metrics.success)}</td>
                    <td className="center">{pct(r.metrics.attendance)}</td>
                    <td className="wrap">{r.note}</td>
                    <td><Muted>{formatDateTime(r.createdAt)}</Muted></td>
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
