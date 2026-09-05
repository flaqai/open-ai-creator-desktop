import dayjs from 'dayjs';

const useFormatPastTime = () => {
  function formatPastTime(time: number): string {
    const now = dayjs();
    const past = dayjs(time);
    const minDiff = now.diff(past, 'minute');

    // if (minDiff < 60) {
    //   return `${minDiff === 0 ? 1 : minDiff} ${t('minutes ago')}`;
    // }
    // if (minDiff < 1440) {
    //   // 24 hours * 60 minutes
    //   return `${Math.floor(minDiff / 60)} ${t('hours ago')}`;
    // }
    // if (minDiff < 1440) {
    // 24 hours * 60 minutes
    // return t('today');
    // }
    // if (minDiff < 2880) {
    //   // 48 hours * 60 minutes
    //   return t('yesterday');
    // }
    // if (minDiff < 10080) {
    //   // 7 days * 24 hours * 60 minutes
    //   return t('last week');
    // }
    // if (minDiff < 43200) {
    //   // 30 days * 24 hours * 60 minutes
    //   return t('last month');
    // }
    return past.format('MM/DD');
  }

  return formatPastTime;
};

export default useFormatPastTime;
