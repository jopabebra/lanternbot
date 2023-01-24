export function getDeclension(n, words) {
	let number = Math.abs(n) % 100;
	if (number > 10 && number < 20) {
		return words[2];
	}
	number = number % 10;
	if (number > 1 && number < 5) {
		return words[1];
	}
	if (number === 1) {
		return words[0];
	}
	return words[2];
}