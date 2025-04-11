import { cn } from "../lib/utils";
import { useField } from "remix-validated-form";
import type { FC } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	label: string;
}

export const Input: FC<InputProps> = ({ name, label, className, ...rest }) => {
	const { error, getInputProps } = useField(name);

	return (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<label
				htmlFor={name}
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{label}
			</label>
			<input
				className={cn(
					"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					error && "border-destructive focus-visible:ring-destructive",
					className,
				)}
				{...rest}
				{...getInputProps({ id: name })}
			/>
			{error && <p className="text-sm font-medium text-destructive">{error}</p>}
		</div>
	);
};
