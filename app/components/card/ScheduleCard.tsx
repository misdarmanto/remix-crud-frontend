export default function ScheduleCard({
  icon,
  title,
  time,
  room,
  color,
  value,
}: any) {
  switch (color) {
    case "indigo":
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-indigo-300 to-indigo-400 shadow-sm text-white p-4 space-y-1 hover:from-indigo-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );

    case "yellow":
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-400 shadow-sm text-white p-4 space-y-1 hover:from-yellow-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );

    case "lime":
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-lime-300 to-lime-400 shadow-sm text-white p-4 space-y-1 hover:from-lime-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );

    case "rose":
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-rose-300 to-rose-400 shadow-sm text-white p-4 space-y-1 hover:from-rose-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );

    case "red":
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-red-300 to-red-400 shadow-sm text-white p-4 space-y-1 hover:from-red-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );

    case "purple":
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-purple-300 to-purple-400 shadow-sm text-white p-4 space-y-1 hover:from-purple-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`cursor-pointer rounded-lg bg-gradient-to-r from-green-300 to-green-400 shadow-sm text-white p-4 space-y-1 hover:from-green-600 transition-colors duration-200 hover:animate-shake`}
        >
          <div className="flex justify-between items-end">
            <div>
              <span className="text-md font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-md font-medium">{value}</span>
            </div>
          </div>
        </div>
      );
  }
}
