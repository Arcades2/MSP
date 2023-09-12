export function getTimeAgoOrExactDate(date: Date) {
  const currentTime = new Date().getTime();

  const timeDifference = currentTime - date.getTime();

  const minutesAgo = Math.floor(timeDifference / (1000 * 60));
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo >= 1) {
    const formattedDate = `${date.toLocaleDateString(
      "fr-fr"
    )} - ${date.toLocaleTimeString("fr-fr")}`;
    return formattedDate;
  }
  if (hoursAgo >= 1) {
    return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
  }
  if (minutesAgo >= 1) {
    return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
  }
  return "less than a minute ago";
}
