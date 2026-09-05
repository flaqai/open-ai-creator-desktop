import styles from './loading.module.css';

export default function Loading() {
  return (
    <div
      aria-label='Orange and tan hamster running in a metal wheel'
      role='img'
      className={styles['wheel-and-hamster']}
    >
      <div className={styles.wheel} />
      <div className={styles.hamster}>
        <div className={styles.hamster__body}>
          <div className={styles.hamster__head}>
            <div className={styles.hamster__ear} />
            <div className={styles.hamster__eye} />
            <div className={styles.hamster__nose} />
          </div>
          <div className={`${styles.hamster__limb} ${styles.hamster__limb__fr}`} />
          <div className={`${styles.hamster__limb} ${styles.hamster__limb__fl}`} />
          <div className={`${styles.hamster__limb} ${styles.hamster__limb__br}`} />
          <div className={`${styles.hamster__limb} ${styles.hamster__limb__bl}`} />
          <div className={styles.hamster__tail} />
        </div>
      </div>
      <div className={styles.spoke} />
    </div>
  );
}
