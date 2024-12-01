import { onMount } from 'svelte';
import { writable, type Updater, type Writable } from 'svelte/store';
import lzString from 'lz-string';
const { decompressFromEncodedURIComponent, compressToEncodedURIComponent } = lzString;

export function urlHash<T>(defaultValue: T): Writable<T> {
	const { subscribe, set, update } = writable(defaultValue);

	function decode(base64: string) {
		return JSON.parse(decompressFromEncodedURIComponent(base64));
	}

	function encode(value: T) {
		return compressToEncodedURIComponent(JSON.stringify(value));
	}

	async function persistentSet(value: T) {
		location.hash = await encode(value);

		set(value);
	}

	function persistentUpdate(fn: Updater<T>) {
		update((oldValue) => {
			const newValue = fn(oldValue);

			location.hash = encode(newValue);
		});
	}

	const base64 = location.hash.substring(1);

	if (base64.length > 0) {
		set(decode(base64));
	}

	return {
		set: persistentSet,
		update: persistentUpdate,
		subscribe
	};
}

export function persistable<T>(key: string, defaultValue: T): Writable<T> {
	let mounted = false;
	const { subscribe, set, update } = writable(defaultValue);

	const persistentSet = (value: T) => {
		set(value);

		if (mounted) {
			const jsonValue = JSON.stringify(value);
			localStorage.setItem(key, jsonValue);
		}
	};

	const persistentUpdate = (fn: Updater<T>) => {
		update((oldValue) => {
			const value = fn(oldValue);

			if (mounted) {
				const jsonValue = JSON.stringify(value);
				localStorage.setItem(key, jsonValue);
			}

			return value;
		});
	};

	onMount(() => {
		mounted = true;
		if (key in localStorage) {
			const value = JSON.parse(localStorage.getItem(key) as string);

			set(value);
		}
	});

	return {
		set: persistentSet,
		update: persistentUpdate,
		subscribe
	};
}
