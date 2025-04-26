// app/components/ClientOnly.tsx
import { useEffect, useState } from "react";

export function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) return <></>;

	return <>{children}</>;
}
