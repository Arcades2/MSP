import { getTimeAgoOrExactDate } from "~/utils/date";

export type LocalDateProps = {
  date: Date;
  className?: string;
};

export default function LocalDate({ date, className }: LocalDateProps) {
  return <div className={className}>{getTimeAgoOrExactDate(date)}</div>;
}
