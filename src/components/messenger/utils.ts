
export const formatLastSeen = (date: Date | string | undefined) => {
  if (!date) return "Не в сети";
  
  const lastSeen = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return "Только что";
  } else if (diffMin < 60) {
    return `Был${diffMin === 1 ? '' : 'а'} ${diffMin} ${getDeclension(diffMin, ['минуту', 'минуты', 'минут'])} назад`;
  } else if (diffHours < 24) {
    return `Был${diffHours === 1 ? '' : 'а'} ${diffHours} ${getDeclension(diffHours, ['час', 'часа', 'часов'])} назад`;
  } else if (diffDays === 1) {
    return "Был вчера";
  } else {
    return `Был${diffDays === 1 ? '' : 'а'} ${diffDays} ${getDeclension(diffDays, ['день', 'дня', 'дней'])} назад`;
  }
};

const getDeclension = (number: number, titles: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20 
      ? 2 
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};

export const generateRandomTime = (hoursAgo = 0) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date;
};
