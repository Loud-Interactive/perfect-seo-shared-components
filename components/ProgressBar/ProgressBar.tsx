'use client';

import styles from './ProgressBar.module.scss'
import { FC } from 'react';

interface ProgressBarProps {
  progress: number;
  status?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, status }) => {
  return (
    <div className={styles.wrap}>
      {progress > 0 && <div
        className={styles.bar}
        style={{ width: `${progress}%` }}
      ></div>}
      <p className={styles.rating}>{progress}% {status && ` | ${status}`}</p>
    </div>
  );
};

export default ProgressBar;