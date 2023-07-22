import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/solid';

type Props = {
  title: string;
  description: string;
  status: string;
};

export default function SimpleCard({ title, description, status }: Props) {
  if (status === 'failed') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-200 flex gap-2  transition duration-200 hover:scale-105 hover:bg-red-100">
        <div className="w-1 rounded-lg h-full bg-red-500"></div>
        {/* <XCircleIcon className="w-7 h-7 text-red-500" /> */}
        <div>
          <h5 className="text-sm text-gray-500 font-semibold capitalize">
            {title}
          </h5>
          <h1 className="text-xl font-semibold text-red-500 capitalize">
            {description}
          </h1>
        </div>
      </div>
    );
  } else if (status === 'process') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-200 flex gap-2  transition duration-200 hover:scale-105 hover:bg-yellow-100">
        <div className="w-1 rounded-lg h-full bg-yellow-500"></div>
        {/* <ExclamationCircleIcon className="w-7 h-7 text-yellow-400" /> */}
        <div>
          <h5 className="text-sm text-gray-500 font-semibold capitalize">
            {title}
          </h5>
          <h1 className="text-xl font-semibold text-yellow-500 capitalize">
            {description}
          </h1>
        </div>
      </div>
    );
  }  else if (status === 'info') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-200 flex gap-2  transition duration-200 hover:scale-105 hover:bg-blue-100">
        <div className="w-1 rounded-lg h-full bg-blue-500"></div>
        {/* <ExclamationCircleIcon className="w-7 h-7 text-blue-400" /> */}
        <div>
          <h5 className="text-sm text-gray-500 font-semibold capitalize">
            {title}
          </h5>
          <h1 className="text-xl font-semibold text-blue-500 capitalize">
            {description}
          </h1>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition duration-200 flex gap-2  transition duration-200 hover:scale-105 hover:bg-green-100">
        <div className="w-1 rounded-lg h-full bg-green-500"></div>
        {/* <CheckCircleIcon className="w-7 h-7 text-green-500" /> */}
        <div>
          <h5 className="text-sm text-gray-500 font-semibold capitalize">
            {title}
          </h5>
          <h1 className="text-xl font-semibold text-green-500 capitalize">
            {description}
          </h1>
        </div>
      </div>
    );
  }
}
