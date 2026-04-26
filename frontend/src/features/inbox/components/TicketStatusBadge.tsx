import { BadgeCheck, CheckCircle2, Cog, ScanEye } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import type { TicketStatus } from '../types';

type Props = {
  status: TicketStatus;
  size?: number;
};

export function TicketStatusBadge({ status, size = 16 }: Props) {
  const { t } = useLanguage();

  const iconProps = { size, 'aria-hidden': true } as const;

  const config = {
    received: { icon: <BadgeCheck {...iconProps} />, label: t('ticketStatus.received') },
    reviewed: { icon: <ScanEye {...iconProps} />, label: t('ticketStatus.reviewed') },
    in_progress: { icon: <Cog {...iconProps} />, label: t('ticketStatus.inProgress') },
    resolved: { icon: <CheckCircle2 {...iconProps} />, label: t('ticketStatus.resolved') },
  } satisfies Record<TicketStatus, { icon: ReactNode; label: string }>;

  const item = config[status];

  return (
    <span className={`ticket-status ticket-status-${status}`} aria-label={item.label}>
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
}
