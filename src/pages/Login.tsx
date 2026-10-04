import { useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { ArrowLeft, BookOpen, Landmark, LogIn, School, Users } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button, Field, Select } from '../components/ui';
import { useStore } from '../store/context';
import { DIRECTOR, DISTRICT_USER, PARENTS, SCHOOL, TEACHERS, studentById, classById, subjectById } from '../data/mockData';
import type { Role } from '../types';
import { fadeUp, slideDown, stagger } from '../styles/animations';

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem 1rem;
  background:
    radial-gradient(1200px 500px at 10% -10%, #DBEAFE 0%, transparent 60%),
    radial-gradient(800px 400px at 110% 110%, #EDE9FE 0%, transparent 60%),
    ${({ theme }) => theme.colors.background};
`;

const Box = styled.div`
  width: 100%;
  max-width: 620px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  padding: 2rem;
  animation: ${fadeUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 1.25rem;
  }
`;

const Head = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const Roles = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }

  > * {
    animation: ${fadeUp} 0.45s ease both;
    ${stagger(80, 4)}
  }
`;

const RoleCard = styled.button<{ $active: boolean }>`
  text-align: left;
  padding: 1rem;
  border-radius: 14px;
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active, theme }) => ($active ? '#F5F9FF' : theme.colors.surface)};
  transition: border-color 0.2s, background 0.2s, transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;

  transform: ${({ $active }) => ($active ? 'translateY(-2px)' : 'none')};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadow.md : 'none')};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  &:hover svg {
    transform: scale(1.15) rotate(-6deg);
  }
  b {
    display: block;
    font-size: 0.95rem;
  }
  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.35;
  }
`;

const Back = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  margin-bottom: 1rem;

  &:hover {
    color: ${({ theme }) => theme.colors.textMain};
  }
`;

const Hint = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  margin-top: 1rem;
`;

const RevealField = styled(Field)`
  margin-bottom: 1rem;
  animation: ${slideDown} 0.3s ease both;
`;

const ROLES: { role: Role; title: string; desc: string; icon: ReactNode }[] = [
  { role: 'teacher', title: 'Мугалим', desc: 'Электрондук журнал, катышуу, үй тапшырма, отчет', icon: <BookOpen size={26} /> },
  { role: 'parent', title: 'Ата-эне', desc: 'Баланын баалары, катышуусу жана тапшырмалары', icon: <Users size={26} /> },
  { role: 'director', title: 'Мектеп директору', desc: 'Мектептин аналитикасы жана отчеттуулук', icon: <School size={26} /> },
  { role: 'district', title: 'Райондук билим бөлүмү', desc: 'Бардык мектептердин көрсөткүчтөрү', icon: <Landmark size={26} /> },
];

export function Login({ onBack }: { onBack: () => void }) {
  const { login } = useStore();
  const [role, setRole] = useState<Role>('teacher');
  const [teacherId, setTeacherId] = useState(TEACHERS[0].id);
  const [parentId, setParentId] = useState(PARENTS[0].id);

  const submit = () => {
    const userId = role === 'teacher' ? teacherId : role === 'parent' ? parentId : role === 'director' ? DIRECTOR.id : DISTRICT_USER.id;
    login({ role, userId });
  };

  return (
    <Page>
      <Box>
        <Back onClick={onBack}><ArrowLeft size={16} /> Башкы бетке</Back>
        <Head>
          <Logo size={40} />
          <p>{SCHOOL.name} · {SCHOOL.district} — демо-кирүү</p>
        </Head>

        <Roles>
          {ROLES.map((r) => (
            <RoleCard key={r.role} type="button" $active={role === r.role} onClick={() => setRole(r.role)}>
              {r.icon}
              <div>
                <b>{r.title}</b>
                <span>{r.desc}</span>
              </div>
            </RoleCard>
          ))}
        </Roles>

        {role === 'teacher' && (
          <RevealField>
            Мугалим
            <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              {TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>{t.name} — {t.subjectIds.map((s) => subjectById(s).name).join(', ')}</option>
              ))}
            </Select>
          </RevealField>
        )}
        {role === 'parent' && (
          <RevealField>
            Ата-эне
            <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              {PARENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.childIds.map((id) => `${studentById(id).name.split(' ')[1]} (${classById(studentById(id).classId).name})`).join(', ')}
                </option>
              ))}
            </Select>
          </RevealField>
        )}

        <Button onClick={submit} style={{ width: '100%', padding: '0.8rem' }}>
          <LogIn size={18} /> Системага кирүү
        </Button>
        <Hint>
          Демо режим: сыр сөз талап кылынбайт. Реалдуу системада кирүү телефон номери + SMS-код аркылуу болот.
          <br />
          Кеңеш: мугалим катары баа коюп, андан кийин ата-эне катары кирип көрүңүз.
        </Hint>
      </Box>
    </Page>
  );
}
