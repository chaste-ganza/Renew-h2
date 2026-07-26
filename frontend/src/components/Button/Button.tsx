import type { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function Button({ children, onClick, type = 'button' }: ButtonProps) {
  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {children}
    </button>
  );
}
