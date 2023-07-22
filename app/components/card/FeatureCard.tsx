export default function FeatureCard({
  svg,
  index,
  name,
  feature,
  setFeature,
  color,
  value,
}: any) {
  switch (color) {
    case "indigo":
      return (
        <div
          className={`bg-indigo-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-indigo-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );

    case "yellow":
      return (
        <div
          className={`bg-yellow-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-yellow-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );

    case "purple":
      return (
        <div
          className={`bg-purple-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-purple-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );

    case "orange":
      return (
        <div
          className={`bg-orange-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-orange-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );

    case "red":
      return (
        <div
          className={`bg-red-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-red-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );
    case "sky":
      return (
        <div
          className={`bg-sky-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-sky-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`bg-green-400 rounded-lg shadow-md p-4 relative overflow-hidden cursor-pointer hover:bg-green-500 transition-colors duration-1000 text-white`}
          onMouseEnter={() => setFeature(index)}
          onMouseLeave={() => setFeature(0)}
        >
          <div className="flex flex-row justify-between items-center">
            <span
              className={`text-md font-medium ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {name}
            </span>
            <span
              className={`text-md font-medium font-lg ml-4 z-30 transition-colors duration-1000 ${
                feature === index && "text-purple-700"
              }`}
            >
              {value}
            </span>
          </div>
        </div>
      );
  }
}
