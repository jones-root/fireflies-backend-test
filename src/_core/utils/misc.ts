export function randomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDate(start: Date, end: Date): Date {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function futureDate(baseDate: Date, maxDays: number) {
	return new Date(baseDate.getTime() + Math.random() * maxDays * 24 * 60 * 60 * 1000);
}
