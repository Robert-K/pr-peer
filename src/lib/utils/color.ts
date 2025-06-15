// Returns a color from blue (low risk) to red (high risk) for a value between `from` and `to` (defaults 0-10)
export function getRiskColor(value: number, from = 0, to = 10): string {
	const clampedValue = Math.max(from, Math.min(to, value));
	const range = to - from;
	const ratio = range === 0 ? 0 : (clampedValue - from) / range;
	const r = Math.round(0 + ratio * 255);
	const g = Math.round(0 + (1 - ratio) * 128);
	const b = Math.round(255 - ratio * 255);
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getContrastColor(hex: string) {
	hex = hex.replace('#', '');
	if (hex.length === 3) {
		hex = hex.split('').map((x) => x + x).join('');
	}
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? '#222' : '#fff';
}
