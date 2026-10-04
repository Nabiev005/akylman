import type { CSSProperties, ReactNode } from 'react';
import styled from 'styled-components';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChartColumn,
  CircleCheck,
  FileText,
  Landmark,
  Languages,
  Lock,
  MessageSquare,
  NotebookPen,
  School,
  Smartphone,
  Users,
  WifiOff,
  FileX,
  Unplug,
  Hourglass,
  Layers,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button, GradeChip } from '../components/ui';
import { useReveal } from '../hooks/useReveal';
import { fadeUp, float, popIn, slideDown } from '../styles/animations';

const Wrap = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  overflow-x: clip;
`;

const Container = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 1.25rem;
`;

/* ---------------- Навигация ---------------- */

const NavBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${slideDown} 0.5s ease both;

  ${Container} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    gap: 1rem;
  }
  nav {
    display: flex;
    gap: 1.5rem;
    font-size: 0.92rem;
    font-weight: 500;

    a {
      position: relative;
      text-decoration: none;
      color: ${({ theme }) => theme.colors.textMuted};
      transition: color 0.2s;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -4px;
        height: 2px;
        border-radius: 2px;
        background: ${({ theme }) => theme.colors.primary};
        transform: scaleX(0);
        transition: transform 0.25s ease;
      }
      &:hover { color: ${({ theme }) => theme.colors.textMain}; }
      &:hover::after { transform: scaleX(1); }
    }
    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      display: none;
    }
  }
`;

/* ---------------- Hero ---------------- */

const Hero = styled.section`
  padding: 4.5rem 0 4rem;
  background:
    radial-gradient(900px 420px at 85% 0%, #DBEAFE 0%, transparent 65%),
    radial-gradient(700px 360px at 0% 100%, #EDE9FE 0%, transparent 60%);

  ${Container} {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 3rem;
    align-items: center;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 2.5rem 0;
  }

  .hero-text > * {
    animation: ${fadeUp} 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .hero-text > :nth-child(1) { animation-delay: 0.05s; }
  .hero-text > :nth-child(2) { animation-delay: 0.15s; }
  .hero-text > :nth-child(3) { animation-delay: 0.25s; }
  .hero-text > :nth-child(4) { animation-delay: 0.35s; }
  .hero-text > :nth-child(5) { animation-delay: 0.45s; }
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 0.82rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
`;

const H1 = styled.h1`
  font-size: clamp(2rem, 4.2vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 1rem 0;

  em {
    font-style: normal;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Lead = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 560px;
`;

const CTAs = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 1.75rem 0 2rem;

  button, a {
    padding: 0.8rem 1.4rem;
    font-size: 1rem;
  }
  button svg {
    transition: transform 0.25s ease;
  }
  button:hover svg {
    transform: translateX(4px);
  }
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-weight: 600;
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surface};
  transition: border-color 0.2s, transform 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const HeroStats = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;

  b {
    display: block;
    font-size: 1.6rem;
    letter-spacing: -0.02em;
  }
  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Mock = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  padding: 1.25rem;
  font-size: 0.85rem;
  animation:
    ${fadeUp} 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both,
    ${float} 6s ease-in-out 1.2s infinite;

  .bar {
    display: flex;
    gap: 6px;
    margin-bottom: 1rem;
    i { width: 10px; height: 10px; border-radius: 50%; background: #E2E8F0; }
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    gap: 0.5rem;
    animation: ${fadeUp} 0.5s ease both;
    &:last-child { border-bottom: none; }
  }
  .row:nth-of-type(3) { animation-delay: 0.7s; }
  .row:nth-of-type(4) { animation-delay: 0.85s; }
  .row:nth-of-type(5) { animation-delay: 1s; }
  .chips { display: flex; gap: 4px; }
  .chips > * { animation-name: ${popIn}; animation-duration: 0.4s; }
  .row:nth-of-type(3) .chips > * { animation-delay: 0.9s; }
  .row:nth-of-type(4) .chips > * { animation-delay: 1.05s; }
  .row:nth-of-type(5) .chips > * { animation-delay: 1.2s; }
  .kpis {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    div {
      background: ${({ theme }) => theme.colors.surfaceAlt};
      border-radius: 10px;
      padding: 0.6rem;
      small { color: ${({ theme }) => theme.colors.textMuted}; display: block; font-size: 0.72rem; }
      b { font-size: 1.15rem; }
    }
  }
  .notify {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background: ${({ theme }) => theme.colors.successSoft};
    color: ${({ theme }) => theme.colors.success};
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
    font-weight: 600;
    animation: ${popIn} 0.5s ease 1.5s both;
  }
`;

/* ---------------- Секциялар ---------------- */

const Section = styled.section<{ $alt?: boolean }>`
  padding: 5rem 0;
  background: ${({ $alt, theme }) => ($alt ? theme.colors.surfaceAlt : theme.colors.surface)};
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 3rem 0;
  }
`;

const SectionHead = styled.div`
  max-width: 720px;
  margin-bottom: 2.5rem;

  .eyebrow {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.primary};
  }
  h2 {
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0.5rem 0 0.75rem;
  }
  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 1.05rem;
  }
`;

const Cards = styled.div<{ $min?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${({ $min }) => $min ?? '250px'}), 1fr));
  gap: 1rem;
`;

const FeatureCard = styled.div<{ $tone?: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.4rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
    border-color: ${({ theme }) => theme.colors.primarySoft};
  }
  &:hover .ic {
    transform: scale(1.1) rotate(-6deg);
  }

  .ic {
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    margin-bottom: 0.9rem;
    background: ${({ $tone }) => $tone ?? '#DBEAFE'};
    color: #0F172A;
  }
  h3 {
    font-size: 1.05rem;
    margin-bottom: 0.4rem;
  }
  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.92rem;
  }
  ul {
    list-style: none;
    margin-top: 0.75rem;
    li {
      display: flex;
      gap: 0.45rem;
      font-size: 0.9rem;
      padding: 0.2rem 0;
      svg { color: ${({ theme }) => theme.colors.success}; flex-shrink: 0; margin-top: 3px; }
    }
  }
`;

const SolutionBand = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const Hub = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  div {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;
    padding: 1rem 0.75rem;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    svg { color: ${({ theme }) => theme.colors.primary}; display: block; margin: 0 auto 0.4rem; }
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${({ theme }) => theme.shadow.md};
    }
  }
  div.center {
    grid-column: 2;
    grid-row: 2;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    animation: hubGlow 2.4s ease-in-out infinite;
    svg { color: white; }
  }
  @keyframes hubGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(29, 78, 216, 0.45); }
    50% { box-shadow: 0 0 0 12px rgba(29, 78, 216, 0); }
  }
`;

const Steps = styled.ol`
  list-style: none;
  counter-reset: step;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 1rem;

  li {
    counter-increment: step;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 16px;
    padding: 1.4rem;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: ${({ theme }) => theme.shadow.lg};
    }
    &:hover::before {
      transform: scale(1.15);
    }

    &::before {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      content: counter(step);
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    h3 { font-size: 1.05rem; margin-bottom: 0.35rem; }
    p { color: ${({ theme }) => theme.colors.textMuted}; font-size: 0.92rem; }
  }
`;

const PriceCard = styled(FeatureCard)<{ $featured?: boolean }>`
  border: 2px solid ${({ $featured, theme }) => ($featured ? theme.colors.primary : theme.colors.border)};
  position: relative;

  .price {
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0.5rem 0 0.1rem;
  }
  .per {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.85rem;
  }
  .ribbon {
    position: absolute;
    top: -12px;
    right: 1rem;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
  }
`;

const CTABand = styled.section`
  background: linear-gradient(135deg, #1D4ED8, #4338CA, #7C3AED, #1D4ED8);
  background-size: 300% 300%;
  animation: ctaShift 12s ease infinite;

  @keyframes ctaShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  color: white;
  padding: 4rem 0;
  text-align: center;

  h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    letter-spacing: -0.02em;
  }
  p {
    opacity: 0.85;
    margin: 0.75rem auto 1.75rem;
    max-width: 600px;
  }
  button {
    background: white;
    color: #1D4ED8;
    padding: 0.85rem 1.6rem;
    font-size: 1rem;
    &:hover:not(:disabled) { background: #EFF6FF; }
  }
`;

const Footer = styled.footer`
  background: ${({ theme }) => theme.colors.sidebar};
  color: #94A3B8;
  padding: 2.5rem 0;
  font-size: 0.88rem;

  ${Container} {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
`;

/* ---------------- Мазмун ---------------- */

const revealDelay = (i: number) => ({ '--reveal-delay': `${i * 90}ms` }) as CSSProperties;

const PROBLEMS: { icon: ReactNode; title: string; text: string; tone: string }[] = [
  { icon: <FileX size={22} />, title: 'Кагаз журналдар', text: 'Айыл мектептеринде баалар жана катышуу дагы эле кагаз журналда жүрөт — жоголот, бузулат, талдоо мүмкүн эмес.', tone: '#FEE2E2' },
  { icon: <Unplug size={22} />, title: 'Ата-эне менен байланыш үзүлгөн', text: 'Ата-энелер баласынын баасын жана сабак калтырганын чейрек аягында гана билишет. Көбү алыста, миграцияда.', tone: '#FEF3C7' },
  { icon: <Hourglass size={22} />, title: 'Отчеттуулукка көп убакыт', text: 'Мугалимдер айына ондогон саатты кол менен отчет жазууга коротот. Райондук бөлүмгө маалымат кечигип жетет.', tone: '#E0F2FE' },
  { icon: <Layers size={22} />, title: 'Чачыранды куралдар', text: 'Бар болгон чечимдер ыңгайсыз, шаарга ылайыкталган, жай интернетте иштебейт жана бири-бири менен байланышпайт.', tone: '#EDE9FE' },
];

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <BookOpen size={22} />, title: 'Электрондук журнал', text: 'Мугалим бааны бир чыкылдатуу менен коёт. Орточо баа, билим сапаты жана жетишүү автоматтык эсептелет.' },
  { icon: <CalendarCheck size={22} />, title: 'Катышууну көзөмөлдөө', text: 'Күнүмдүк катышуу 30 секундда белгиленет. Бала сабакка келбесе, ата-эне ошол замат билет.' },
  { icon: <NotebookPen size={22} />, title: 'Үй тапшырмалары', text: 'Тапшырма мөөнөтү менен берилет, ата-эне аткарылганын белгилейт, мугалим статистиканы көрөт.' },
  { icon: <FileText size={22} />, title: 'Мугалимдин отчеттору', text: 'Айлык отчет журналдагы маалыматтан автоматтык түзүлөт — директор онлайн бекитет.' },
  { icon: <MessageSquare size={22} />, title: 'Ата-эне менен байланыш', text: 'Мектептин кабарлары, класстык жана жеке билдирүүлөр — бир жерде, WhatsApp топторунун башаламандыгысыз.' },
  { icon: <ChartColumn size={22} />, title: 'Аналитика жана эрте эскертүү', text: 'Артта калып жаткан же көп калтырган окуучулар автоматтык аныкталат.' },
];

const ROLES: { icon: ReactNode; title: string; items: string[] }[] = [
  { icon: <BookOpen size={22} />, title: 'Мугалим', items: ['Электрондук журнал', 'Катышууну белгилөө', 'Үй тапшырма берүү', 'Автоматтык айлык отчет'] },
  { icon: <Users size={22} />, title: 'Ата-эне', items: ['Баалар реалдуу убакытта', 'Катышуу календары', 'Үй тапшырмалар', 'Мугалимге түз жазуу'] },
  { icon: <School size={22} />, title: 'Мектеп директору', items: ['Мектептин аналитикасы', 'Мугалимдердин активдүүлүгү', 'Отчетторду бекитүү', 'Районго бир баскыч менен отчет'] },
  { icon: <Landmark size={22} />, title: 'Райондук билим бөлүмү', items: ['Бардык мектептер бир панелде', 'Мектептердин рейтинги', 'Кагазсыз отчеттор', "Excel'ге экспорт"] },
];

const WHY: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <WifiOff size={22} />, title: 'Жай интернетте иштейт', text: 'Жеңил интерфейс 3G байланышта да тез ачылат. Маалымат түзмөктө сакталат.' },
  { icon: <Smartphone size={22} />, title: 'Телефондон толук иштейт', text: 'Ата-энелердин көбү смартфон колдонот — платформа мобилдикке ылайыкталган, үй экранына орнотулат.' },
  { icon: <Languages size={22} />, title: 'Кыргыз тилинде', text: 'Интерфейс толугу менен мамлекеттик тилде. Орус тили — кийинки версияда.' },
  { icon: <Lock size={22} />, title: 'Маалымат коопсуздугу', text: 'Ар бир роль өз маалыматын гана көрөт. Серверлер Кыргызстанда жайгаштырылат.' },
];

export function Landing({ onStart }: { onStart: () => void }) {
  useReveal();
  return (
    <Wrap>
      <NavBar>
        <Container>
          <Logo />
          <nav>
            <a href="#problem">Көйгөй</a>
            <a href="#solution">Чечим</a>
            <a href="#features">Мүмкүнчүлүктөр</a>
            <a href="#pricing">Тарифтер</a>
          </nav>
          <Button onClick={onStart}>Демону ачуу</Button>
        </Container>
      </NavBar>

      <Hero>
        <Container>
          <div className="hero-text">
            <Tag><Landmark size={14} /> «Санарип аймак» багыты</Tag>
            <H1>Региондук мектептер үчүн <em>бирдиктүү санариптик</em> платформа</H1>
            <Lead>
              Akylman.kg — айыл жергелериндеги мектептер жана окуу борборлору үчүн SaaS платформасы (LMS & School Management).
              Баалар, катышуу, үй тапшырмалар, мугалимдердин отчеттору жана ата-эне көзөмөлү — бир жерде.
            </Lead>
            <CTAs>
              <Button onClick={onStart}>Демого кирүү <ArrowRight size={18} /></Button>
              <LinkButton href="#solution">Кантип иштейт?</LinkButton>
            </CTAs>
            <HeroStats>
              <div><b>4 роль</b><span>мугалим, ата-эне, директор, район</span></div>
              <div><b>0 кагаз</b><span>отчет автоматтык түзүлөт</span></div>
              <div><b>24/7</b><span>ата-эне көзөмөлү</span></div>
            </HeroStats>
          </div>

          <Mock aria-hidden="true">
            <div className="bar"><i /><i /><i /></div>
            <div className="kpis">
              <div><small>Орточо баа</small><b>4.21</b></div>
              <div><small>Сапат</small><b>72%</b></div>
              <div><small>Катышуу</small><b>95%</b></div>
            </div>
            <div className="row"><span>Адылбеков Асан</span><span className="chips"><GradeChip $value={5}>5</GradeChip><GradeChip $value={5}>5</GradeChip><GradeChip $value={4}>4</GradeChip></span></div>
            <div className="row"><span>Бакытова Айпери</span><span className="chips"><GradeChip $value={4}>4</GradeChip><GradeChip $value={5}>5</GradeChip><GradeChip $value={4}>4</GradeChip></span></div>
            <div className="row"><span>Кадыров Эмил</span><span className="chips"><GradeChip $value={3}>3</GradeChip><GradeChip $value={4}>4</GradeChip><GradeChip $value={4}>4</GradeChip></span></div>
            <div className="notify"><CircleCheck size={18} /> Ата-энеге билдирүү жөнөтүлдү: «Математика — 5»</div>
          </Mock>
        </Container>
      </Hero>

      <Section id="problem" $alt>
        <Container>
          <SectionHead data-reveal>
            <div className="eyebrow">Көйгөй</div>
            <h2>Региондордогу мектептер санариптик ажырымда калууда</h2>
            <p>
              Айыл жергелериндеги жана региондордогу мектептерде электрондук журналдар, окуучулардын жетишүүсүн көзөмөлдөө,
              ата-энелер менен байланыш жана отчеттуулук процесси толук санариптештирилген эмес же ыңгайсыз.
            </p>
          </SectionHead>
          <Cards>
            {PROBLEMS.map((p, i) => (
              <FeatureCard data-reveal style={revealDelay(i)} key={p.title} $tone={p.tone}>
                <div className="ic">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </FeatureCard>
            ))}
          </Cards>
        </Container>
      </Section>

      <Section id="solution">
        <Container>
          <SolutionBand>
            <SectionHead data-reveal style={{ marginBottom: 0 }}>
              <div className="eyebrow">Чечим</div>
              <h2>Бардык процесстер — бир платформада</h2>
              <p>
                Мектептерге жана билим берүү мекемелерине арналган ыңгайлуу веб жана мобилдик платформа. Окуучулардын баалары,
                катышуусу, үй тапшырмалары, мугалимдердин отчеттору жана ата-энелердин көзөмөлү бир жерде биригет.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                Мугалим журналга бир жолу киргизген маалымат ата-энеге, директорго жана райондук билим берүү бөлүмүнө
                автоматтык түрдө жетет — кайра-кайра кол менен жазуунун кереги жок.
              </p>
            </SectionHead>
            <Hub data-reveal style={revealDelay(2)}>
              <div><BookOpen size={22} />Баалар</div>
              <div><CalendarCheck size={22} />Катышуу</div>
              <div><NotebookPen size={22} />Үй тапшырма</div>
              <div><FileText size={22} />Отчеттор</div>
              <div className="center"><School size={22} />Akylman.kg</div>
              <div><Users size={22} />Ата-эне</div>
              <div><MessageSquare size={22} />Байланыш</div>
              <div><ChartColumn size={22} />Аналитика</div>
              <div><Landmark size={22} />Район</div>
            </Hub>
          </SolutionBand>
        </Container>
      </Section>

      <Section id="features" $alt>
        <Container>
          <SectionHead data-reveal>
            <div className="eyebrow">Мүмкүнчүлүктөр</div>
            <h2>Мектептин күнүмдүк иши үчүн керектүүнүн баары</h2>
          </SectionHead>
          <Cards>
            {FEATURES.map((f, i) => (
              <FeatureCard data-reveal style={revealDelay(i)} key={f.title}>
                <div className="ic">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </FeatureCard>
            ))}
          </Cards>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHead data-reveal>
            <div className="eyebrow">Ар бир катышуучу үчүн</div>
            <h2>Төрт роль — бир маалымат базасы</h2>
          </SectionHead>
          <Cards $min="230px">
            {ROLES.map((r, i) => (
              <FeatureCard data-reveal style={revealDelay(i)} key={r.title}>
                <div className="ic">{r.icon}</div>
                <h3>{r.title}</h3>
                <ul>
                  {r.items.map((i) => <li key={i}><CircleCheck size={15} />{i}</li>)}
                </ul>
              </FeatureCard>
            ))}
          </Cards>
        </Container>
      </Section>

      <Section $alt>
        <Container>
          <SectionHead data-reveal>
            <div className="eyebrow">Региондор үчүн түзүлгөн</div>
            <h2>Айыл мектебинин чындыгына ылайыкташтырылган</h2>
          </SectionHead>
          <Cards>
            {WHY.map((w, i) => (
              <FeatureCard data-reveal style={revealDelay(i)} key={w.title} $tone="#D1FAE5">
                <div className="ic">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </FeatureCard>
            ))}
          </Cards>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHead data-reveal>
            <div className="eyebrow">Масштабдоо планы</div>
            <h2>Мектептен — мамлекеттик деңгээлдеги санариптик чекитке</h2>
            <p>Мектеп сайттарын жасоо тажрыйбасынын негизинде платформа этап-этабы менен кеңейет.</p>
          </SectionHead>
          <Steps>
            <li data-reveal style={revealDelay(0)}><h3>Пилот</h3><p>Бир райондогу 5–8 мектеп. Мугалимдерди окутуу, кайтарым байланыш чогултуу.</p></li>
            <li data-reveal style={revealDelay(1)}><h3>Облус</h3><p>Облустун бардык райондук билим берүү бөлүмдөрүн туташтыруу, бирдиктүү отчет форматы.</p></li>
            <li data-reveal style={revealDelay(2)}><h3>Республика</h3><p>Билим берүү министрлигинин маалымат системалары менен интеграция, улуттук аналитика.</p></li>
            <li data-reveal style={revealDelay(3)}><h3>Окуу борборлору</h3><p>Жеке окуу борборлору жана курстар үчүн LMS модулу — кошумча киреше булагы.</p></li>
          </Steps>
        </Container>
      </Section>

      <Section id="pricing" $alt>
        <Container>
          <SectionHead data-reveal>
            <div className="eyebrow">Тарифтер (SaaS)</div>
            <h2>Орнотуу жок, сервер жок — жазылуу гана</h2>
            <p>Баалар болжолдуу, пилоттук мектептер үчүн акысыз.</p>
          </SectionHead>
          <Cards $min="260px">
            <PriceCard data-reveal style={revealDelay(0)}>
              <h3>Пилот</h3>
              <div className="price">0 сом</div>
              <div className="per">3 ай, 1 мектеп</div>
              <ul>
                <li><CircleCheck size={15} />Бардык модулдар</li>
                <li><CircleCheck size={15} />Мугалимдерди окутуу</li>
                <li><CircleCheck size={15} />Маалыматты көчүрүү жардамы</li>
              </ul>
            </PriceCard>
            <PriceCard data-reveal style={revealDelay(1)} $featured>
              <span className="ribbon">Мектептер үчүн</span>
              <h3>Мектеп</h3>
              <div className="price">15 сом</div>
              <div className="per">окуучу башына / айына</div>
              <ul>
                <li><CircleCheck size={15} />Чексиз мугалим жана ата-эне</li>
                <li><CircleCheck size={15} />Автоматтык отчеттор</li>
                <li><CircleCheck size={15} />SMS-билдирүүлөр</li>
                <li><CircleCheck size={15} />Колдоо кызматы</li>
              </ul>
            </PriceCard>
            <PriceCard data-reveal style={revealDelay(2)}>
              <h3>Район / Облус</h3>
              <div className="price">Келишим</div>
              <div className="per">мамлекеттик сатып алуу аркылуу</div>
              <ul>
                <li><CircleCheck size={15} />Райондук аналитика панели</li>
                <li><CircleCheck size={15} />Бардык мектептерди туташтыруу</li>
                <li><CircleCheck size={15} />Интеграция жана жеке сервер</li>
              </ul>
            </PriceCard>
          </Cards>
        </Container>
      </Section>

      <CTABand>
        <Container data-reveal>
          <h2>Платформаны азыр эле сынап көрүңүз</h2>
          <p>Мугалим, ата-эне, директор же райондук бөлүмдүн кызматкери катары кирип, системанын кантип иштээрин көрүңүз.</p>
          <Button onClick={onStart}>Демого кирүү <ArrowRight size={18} /></Button>
        </Container>
      </CTABand>

      <Footer>
        <Container>
          <Logo light size={28} />
          <span>© {new Date().getFullYear()} Akylman.kg · «Санарип аймак» · Региондук билим берүүнүн сапаты үчүн</span>
        </Container>
      </Footer>
    </Wrap>
  );
}
