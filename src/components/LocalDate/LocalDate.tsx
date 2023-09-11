export type LocalDateProps = {
  date: Date;
  className?: string;
};

// TODO : code "x minutes/hours ago" conditions + dynamic localization
export default function LocalDate({ date, className }: LocalDateProps) {
  return (
    <div className={className}>
      {date.toLocaleDateString("fr-fr")} - {date.toLocaleTimeString("fr-fr")}
    </div>
  );
}
