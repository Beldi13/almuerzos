"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = {
  onDateChange: (date: string) => void;
};

export default function FechaSelector({ onDateChange }: Props) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (selected) {
      const formatted = format(selected, "yyyy-MM-dd");
      onDateChange(formatted);
    }
  }, [selected, onDateChange]);

  return (
    <div>
      <p className="mb-2 font-semibold">Selecciona una fecha</p>
      <DayPicker
        fixedWeeks
        showWeekNumber
        captionLayout="dropdown"
        navLayout="around"
        mode="single"
        selected={selected}
        onSelect={setSelected}
        footer={selected ? <p className="mt-2">Seleccionado: {format(selected, "PPP")}</p> : null}
      />
    </div>
  );
}
