declare module "siphash/lib/siphash13" {
	interface IU64 {
		h: number;
		l: number;
	}

	export function hash(key: Uint32Array, m: Uint8Array | string): IU64;
}
