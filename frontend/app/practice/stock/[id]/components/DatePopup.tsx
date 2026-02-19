"use client"

interface DatePopupProps {
  isVisible: boolean
  date: string
}

export const DatePopup = ({ isVisible, date }: DatePopupProps) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none">
      <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
        <div className="text-2xl text-gray-300 mb-2 font-medium">Today is</div>
        <div className="text-6xl md:text-8xl font-bold text-white tracking-tight drop-shadow-2xl">
          {date}
        </div>
      </div>
    </div>
  )
}
