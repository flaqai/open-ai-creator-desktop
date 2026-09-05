import styles from './CoreFeaturesCard.module.css';

export default function CoreFeaturesCard({ title, content, src }: { title: string; content: string; src: string }) {
  return (
    <li className={`group bg-card-black w-full rounded-xl p-8 lg:max-w-[422px] ${styles.notification}`}>
      <div className={styles.notiglow} />
      <div className={styles.notiborderglow} />
      <div className='flex w-full flex-col items-center gap-3 group-hover:translate-x-1'>
        <img src={src} alt={title} title={title} className='size-16' />
        <div className='flex flex-col items-center gap-1 text-center'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='text-sm text-white/70'>{content}</p>
        </div>
      </div>
    </li>
  );
}
