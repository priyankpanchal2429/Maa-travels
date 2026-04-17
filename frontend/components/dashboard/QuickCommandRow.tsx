import React from 'react';
import { Plus, IndianRupee, UserSquare2, Bus } from 'lucide-react';
import Link from 'next/link';
import styles from './QuickCommandRow.module.css';

const QuickCommandRow = () => {
  const commands = [
    {
      label: 'Enroll Student',
      icon: <Plus size={20} />,
      href: '/students',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)'
    },
    {
      label: 'Collect Payment',
      icon: <IndianRupee size={20} />,
      href: '/payments',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    {
      label: 'Add Driver',
      icon: <UserSquare2 size={20} />,
      href: '/drivers',
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.4)'
    },
    {
      label: 'Update Fleet',
      icon: <Bus size={20} />,
      href: '/buses',
      color: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.4)'
    }
  ];

  return (
    <div className={styles.row}>
      {commands.map((cmd, idx) => (
        <Link key={idx} href={cmd.href} className={styles.commandCard} style={{ '--cmd-color': cmd.color, '--cmd-glow': cmd.glow } as any}>
          <div className={styles.iconBox}>{cmd.icon}</div>
          <span className={styles.label}>{cmd.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default QuickCommandRow;
