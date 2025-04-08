import { useField } from "remix-validated-form";

interface SelectProps {
	name: string;
	label: string;
	options: { value: string; label: string }[];
}

export function Select({ name, label, options }: SelectProps) {
	const { getInputProps } = useField(name);

	return (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-700 mb-1">
				{label}
			</label>
			<select
				className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				{...getInputProps()}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
