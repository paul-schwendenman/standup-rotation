import { onMount } from "svelte";
import { writable } from "svelte/store";

export function persistable(key, defaultValue) {
	let mounted = false;
	const { subscribe, set, update} = writable(defaultValue);

	const persistantSet = (value) => {
		set(value);

		if(mounted) {
			const jsonValue = JSON.stringify(value);
			localStorage.setItem(key, jsonValue);
		}
	};

	const persistantUpdate = (fn) => {
		update((oldValue) => {
			const value = fn(oldValue);

			if(mounted) {
				const jsonValue = JSON.stringify(value);
				localStorage.setItem(key, jsonValue);
			}

			return value
		})
	}

	onMount(() => {
		mounted = true;
		if(key in localStorage) {
			const value = JSON.parse(localStorage.getItem(key))

			set(value);
		}
	});

	return {
		set: persistantSet,
		update: persistantUpdate,
		subscribe
	}
}