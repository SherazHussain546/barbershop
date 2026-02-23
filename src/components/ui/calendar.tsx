"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-6 w-full",
        caption: "flex justify-center pt-2 relative items-center mb-6",
        caption_label: "text-xl font-headline font-bold text-slate-900 px-10",
        nav: "flex items-center justify-between absolute left-0 right-0 top-2 px-0",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 opacity-100 hover:opacity-100 transition-all rounded-full hover:bg-slate-100 border border-slate-100"
        ),
        nav_button_previous: "left-0",
        nav_button_next: "right-0",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 w-full mb-4",
        head_cell: "text-slate-400 font-bold text-[0.7rem] uppercase tracking-[0.2em] text-center flex items-center justify-center",
        row: "grid grid-cols-7 w-full mt-2",
        cell: "h-12 relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-bold aria-selected:opacity-100 rounded-full transition-all hover:bg-primary/10 hover:text-primary flex items-center justify-center"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white shadow-lg shadow-primary/30 scale-105",
        day_today: "bg-slate-50 text-slate-900 border border-slate-200",
        day_outside:
          "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-500/50 aria-selected:text-white aria-selected:opacity-30",
        day_disabled: "text-slate-200 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-5 w-5", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-5 w-5", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
