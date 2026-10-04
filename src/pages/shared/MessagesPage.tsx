import { useMemo, useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Megaphone, Send, Users, User } from 'lucide-react';
import { useStore } from '../../store/context';
import { userName } from '../../data/mockData';
import { recipientsFor, shortLabel, visibleMessages } from '../../utils/messages';
import { formatDateTime } from '../../utils/date';
import { Badge, Button, Card, CardHead, EmptyState, Field, PageHeader, Select, Split, Textarea } from '../../components/ui';
import type { Role } from '../../types';
import { fadeUp, stagger } from '../../styles/animations';

const ROLE_LABEL: Record<Role, string> = {
  director: 'Директор',
  teacher: 'Мугалим',
  parent: 'Ата-эне',
  district: 'Район',
};

const Bubble = styled.div<{ $mine: boolean }>`
  padding: 0.9rem 1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme, $mine }) => ($mine ? theme.colors.primarySoft : theme.colors.border)};
  background: ${({ theme, $mine }) => ($mine ? '#F5F9FF' : theme.colors.surface)};
  margin-bottom: 0.75rem;
  animation: ${fadeUp} 0.4s ease both;
  ${stagger(50, 10)}
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
    transform: translateX(2px);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 0.4rem;
  }
  .from {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMain};
  }
  .text {
    font-size: 0.92rem;
    white-space: pre-wrap;
  }
`;

export function MessagesPage() {
  const { data, session, sendMessage } = useStore();
  const recipients = useMemo(() => (session ? recipientsFor(session) : []), [session]);
  const [to, setTo] = useState(recipients[0]?.key ?? '');
  const [text, setText] = useState('');

  if (!session) return null;
  const messages = visibleMessages(data, session);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = recipients.find((x) => x.key === to);
    if (!r || !text.trim()) return;
    sendMessage({
      fromId: session.userId,
      fromName: userName(session.role, session.userId),
      fromRole: session.role,
      to: r.target,
      toLabel: shortLabel(r.label),
      text: text.trim(),
    });
    setText('');
  };

  return (
    <>
      <PageHeader title="Билдирүүлөр" subtitle="Мектеп, мугалимдер жана ата-энелер ортосундагы түз байланыш" />
      <Split $ratio="1.6fr 1fr">
        <Card>
          <CardHead>
            <h3>Келген жана жөнөтүлгөн</h3>
            <span className="muted">{messages.length} билдирүү</span>
          </CardHead>
          {messages.length === 0 && <EmptyState>Азырынча билдирүү жок</EmptyState>}
          {messages.map((m) => {
            const mine = m.fromId === session.userId;
            return (
              <Bubble key={m.id} $mine={mine}>
                <div className="meta">
                  <span className="from">{mine ? 'Сиз' : m.fromName}</span>
                  {!mine && <Badge $tone="neutral">{ROLE_LABEL[m.fromRole]}</Badge>}
                  <span>→</span>
                  {m.to.type === 'school' ? (
                    <Badge $tone="violet"><Megaphone size={12} /> Бүт мектеп</Badge>
                  ) : m.to.type === 'class' ? (
                    <Badge $tone="info"><Users size={12} /> {m.toLabel}</Badge>
                  ) : (
                    <Badge $tone="primary"><User size={12} /> {m.to.userId === session.userId ? 'Сизге' : m.toLabel}</Badge>
                  )}
                  <span style={{ marginLeft: 'auto' }}>{formatDateTime(m.createdAt)}</span>
                </div>
                <div className="text">{m.text}</div>
              </Bubble>
            );
          })}
        </Card>

        <Card as="form" onSubmit={submit}>
          <CardHead><h3><Send size={18} /> Жаңы билдирүү</h3></CardHead>
          <Field style={{ marginBottom: '0.9rem' }}>
            Кимге
            <Select value={to} onChange={(e) => setTo(e.target.value)}>
              {recipients.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </Select>
          </Field>
          <Field style={{ marginBottom: '0.9rem' }}>
            Текст
            <Textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Билдирүүңүздү жазыңыз..."
              required
            />
          </Field>
          <Button type="submit" disabled={!text.trim()} style={{ width: '100%' }}>
            <Send size={16} /> Жөнөтүү
          </Button>
        </Card>
      </Split>
    </>
  );
}
