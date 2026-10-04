import { useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { LogOut, Menu, RotateCcw, X } from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../store/context';
import { SCHOOL } from '../data/mockData';
import { fadeIn, fadeUp, pulse, stagger } from '../styles/animations';

export interface NavItem<K extends string = string> {
  key: K;
  label: string;
  icon: ReactNode;
  badge?: number;
}

const SIDEBAR_W = '264px';

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  width: ${SIDEBAR_W};
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.sidebar};
  color: #CBD5E1;
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  transition: transform 0.25s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
    box-shadow: ${({ $open, theme }) => ($open ? theme.shadow.lg : 'none')};
  }
`;

const SideTop = styled.div`
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const SchoolInfo = styled.div`
  margin-top: 0.75rem;
  font-size: 0.78rem;
  color: #94A3B8;
  line-height: 1.4;

  b {
    color: #E2E8F0;
    font-weight: 600;
    display: block;
  }
`;

const CloseBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: #94A3B8;
  padding: 0.25rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  border: none;
  text-align: left;
  font-size: 0.92rem;
  font-weight: 500;
  position: relative;
  background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.18)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#CBD5E1')};
  transition: background 0.2s, color 0.2s, padding-left 0.2s;
  animation: ${fadeUp} 0.4s ease both;
  ${stagger(50, 10)}

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: ${({ $active }) => ($active ? '60%' : '0')};
    transform: translateY(-50%);
    border-radius: 0 3px 3px 0;
    background: #60A5FA;
    transition: height 0.25s ease;
  }
  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.22)' : 'rgba(255, 255, 255, 0.06)')};
    color: #fff;
    padding-left: 1rem;
  }
  svg {
    color: ${({ $active }) => ($active ? '#60A5FA' : '#64748B')};
    flex-shrink: 0;
    transition: color 0.2s, transform 0.25s;
  }
  &:hover svg {
    transform: scale(1.12);
  }
  .badge {
    margin-left: auto;
    background: #EF4444;
    color: #fff;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.05rem 0.45rem;
    animation: ${pulse} 2s ease-out infinite;
  }
`;

const SideBottom = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.75rem;

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #1D4ED8;
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 700;
    flex-shrink: 0;
  }
  .name {
    color: #F1F5F9;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .role {
    font-size: 0.75rem;
    color: #94A3B8;
  }
`;

const SmallBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #CBD5E1;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.82rem;
  margin-top: 0.35rem;

  transition: background 0.2s, color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  &:hover svg {
    transform: rotate(-20deg);
  }
  svg {
    transition: transform 0.3s;
  }
`;

const Overlay = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 30;
    animation: ${fadeIn} 0.25s ease both;
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  margin-left: ${SIDEBAR_W};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 20;
    background: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.6rem 1rem;

    button {
      background: none;
      border: none;
      padding: 0.35rem;
      display: grid;
      place-items: center;
    }
  }
`;

const Content = styled.div`
  animation: ${fadeIn} 0.3s ease both;
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 1rem;
  }
`;

interface Props<K extends string> {
  nav: NavItem<K>[];
  active: K;
  onNavigate: (key: K) => void;
  roleLabel: string;
  userName: string;
  /** Сайдбардагы уюмдун аты (демейки — мектеп) */
  org?: string;
  children: ReactNode;
}

export function AppLayout<K extends string>({ nav, active, onNavigate, roleLabel, userName, org, children }: Props<K>) {
  const { logout, resetDemo } = useStore();
  const [open, setOpen] = useState(false);
  const initials = userName.split(' ').slice(0, 2).map((w) => w[0]).join('');

  const go = (key: K) => {
    onNavigate(key);
    setOpen(false);
    window.scrollTo({ top: 0 });
  };

  const handleReset = () => {
    if (window.confirm('Демо-маалыматтар баштапкы абалга кайтарылат. Улантасызбы?')) resetDemo();
  };

  return (
    <Shell>
      <Overlay $open={open} onClick={() => setOpen(false)} />
      <Sidebar $open={open}>
        <SideTop>
          <div>
            <Logo light size={30} />
            <SchoolInfo>
              <b>{roleLabel}</b>
              {org ?? `${SCHOOL.name} · ${SCHOOL.district}`}
            </SchoolInfo>
          </div>
          <CloseBtn onClick={() => setOpen(false)} aria-label="Менюну жабуу"><X size={20} /></CloseBtn>
        </SideTop>

        <Nav>
          {nav.map((item) => (
            <NavBtn key={item.key} $active={item.key === active} onClick={() => go(item.key)}>
              {item.icon}
              {item.label}
              {!!item.badge && <span className="badge">{item.badge}</span>}
            </NavBtn>
          ))}
        </Nav>

        <SideBottom>
          <UserCard>
            <div className="avatar">{initials}</div>
            <div>
              <div className="name">{userName}</div>
              <div className="role">{roleLabel}</div>
            </div>
          </UserCard>
          <SmallBtn onClick={handleReset}><RotateCcw size={15} /> Демону кайра баштоо</SmallBtn>
          <SmallBtn onClick={logout}><LogOut size={15} /> Чыгуу</SmallBtn>
        </SideBottom>
      </Sidebar>

      <Main>
        <TopBar>
          <button onClick={() => setOpen(true)} aria-label="Менюну ачуу"><Menu size={24} /></button>
          <Logo size={28} />
          <span style={{ width: 32 }} />
        </TopBar>
        {/* key — бөлүм алмашканда анимация кайра башталат */}
        <Content key={active}>{children}</Content>
      </Main>
    </Shell>
  );
}
