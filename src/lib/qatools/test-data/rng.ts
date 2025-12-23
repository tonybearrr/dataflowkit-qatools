/**
 * Mulberry32 - a fast, simple PRNG with good distribution
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md
 */
export function createRng(seed: string): () => number {
	if (!seed) {
		// Use crypto for non-deterministic seed
		const array = new Uint32Array(1);
		crypto.getRandomValues(array);
		seed = array[0].toString();
	}

	// Simple hash function to convert string to number
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	let state = hash >>> 0; // Ensure positive

	return function mulberry32() {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), state | 1);
		t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
