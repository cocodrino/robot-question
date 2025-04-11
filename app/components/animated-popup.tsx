import { motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";

interface AnimatedPopupProps {
	children: ReactNode;
	ubication: "top" | "bottom";
	margin?: number;
	timeTransition: number;
	timeToShow?: number;
}

export function AnimatedPopup({
	children,
	ubication,
	margin = 20,
	timeTransition,
	timeToShow,
}: AnimatedPopupProps) {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		if (timeToShow) {
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, timeToShow);

			return () => clearTimeout(timer);
		}
	}, [timeToShow]);

	const initialY = ubication === "top" ? -100 : 100;
	const animateY = ubication === "top" ? margin : `calc(100vh - ${margin}px)`;

	if (!isVisible) return null;

	return (
		<motion.div
			initial={{ y: initialY, opacity: 0 }}
			animate={{
				y: animateY,
				opacity: 1,
				transition: {
					type: "spring",
					stiffness: 300,
					damping: 20,
					duration: timeTransition,
				},
			}}
			exit={{
				y: initialY,
				opacity: 0,
				transition: {
					type: "spring",
					stiffness: 300,
					damping: 20,
					duration: timeTransition,
				},
			}}
			style={{
				position: "fixed",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 1000,
			}}
		>
			{children}
		</motion.div>
	);
}
