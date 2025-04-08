import { useField } from "remix-validated-form";

interface RadioGroupProps {
	name: string;
	options: { value: string; label: string }[];
}

export function RadioGroup({ name, options }: RadioGroupProps) {
	const { getInputProps } = useField(name);

	return (
		<div className="flex gap-4 mb-4">
			{options.map((option) => (
				<label
					key={option.value}
					className="flex items-center gap-2 cursor-pointer"
				>
					<input
						type="radio"
						className="w-4 h-4"
						{...getInputProps({ value: option.value })}
					/>
					{option.label}
				</label>
			))}
		</div>
	);
}
