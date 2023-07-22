import { TrashIcon, PlusCircleIcon } from "@heroicons/react/outline";
import { useState } from "react";

export default function ReferralFeeLevels({ levels = [{ level: 1, value: "" }] }) {
	const [sharingReferalLevels, setSharingReferalLevels] = useState<any[]>(levels);
	const [levelValue, setLavelValue] = useState<number>(0);
	const [isInvalidInputLavel, setIsInvalidInputLevel] = useState({ error: false, level: 0 });

	const handleAddSharingReferalLevel = () => {
		if (isInvalidInputLavel.error || levelValue === 0) return;
		if (sharingReferalLevels.length >= 5) return;
		const lastLevel = sharingReferalLevels.length + 1;
		setSharingReferalLevels([...sharingReferalLevels, { level: lastLevel, value: "" }]);
		setLavelValue(0);
	};

	const handleDeleteSharingReferalLevel = () => {
		if (sharingReferalLevels.length <= 1) return;
		const lastLevel = sharingReferalLevels[sharingReferalLevels.length - 1];
		const newLevels = sharingReferalLevels.filter((value) => value !== lastLevel);
		setSharingReferalLevels(newLevels);
	};

	const handleValidateInputLevel = ({ event, level }: { event: any; level: number }) => {
		setIsInvalidInputLevel({ error: false, level: level });
		const value = parseInt(event.target.value);
		if (level === 1 && value > 20) setIsInvalidInputLevel({ error: true, level: level });
		if (level === 2 && value > 10) setIsInvalidInputLevel({ error: true, level: level });
		if (level === 3 && value > 5) setIsInvalidInputLevel({ error: true, level: level });
		if (level === 4 && value > 3) setIsInvalidInputLevel({ error: true, level: level });
		if (level === 5 && value > 2) setIsInvalidInputLevel({ error: true, level: level });
		setLavelValue(value);
	};

	const placeholderList = ["20%", "10%", "5%", "3%", "2%"];

	return (
		<div>
			{sharingReferalLevels.map((currentLevel: any, index: number) => {
				const isInvalid =
					isInvalidInputLavel.error && isInvalidInputLavel.level === currentLevel.level;
				return (
					<div key={index} className="flex items-center">
						<dt className="mr-2 text-sm font-medium text-gray-500">Level {currentLevel.level}</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-">
							<div className="mt-1 w-full relative rounded-md shadow-sm">
								<input
									type="number"
									name={`level_${currentLevel.level}`}
									defaultValue={currentLevel.value}
									className={`flex-flex-initial w-64 block px-3 py-2 
                        border ${isInvalid ? "border-red-500 text-red-500" : "border-gray-300"}  
                        rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
									placeholder={"maksimal " + placeholderList[index]}
									onChange={(e) => {
										if (
											sharingReferalLevels.length === 1 &&
											sharingReferalLevels[0].value === ""
										) {
											setSharingReferalLevels([
												{ level: 1, value: parseInt(e.target.value) },
											]);
										}
										handleValidateInputLevel({ event: e, level: currentLevel.level });
									}}
								/>
							</div>
						</dd>
						<TrashIcon
							onClick={handleDeleteSharingReferalLevel}
							className="text-xs p-1 mx-1 h-8 w-8 text-red-500 hover:bg-red-200 rounded-full"
						/>
						<PlusCircleIcon
							onClick={handleAddSharingReferalLevel}
							className="text-xs mx-1 p-1 h-8 w-8 text-teal-500 hover:bg-teal-200 rounded-full"
						/>
					</div>
				);
			})}
		</div>
	);
}
