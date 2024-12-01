<script lang="ts">
	import ThemeExample from './ThemeExample.svelte';
	import { onMount } from 'svelte';
	import { setTheme, loadTheme } from '../utils';
	import { themes, type Theme } from '$lib/types';

	let currentTheme: Theme | null = null;

	const handleSetTheme = (theme: Theme) => {
		if (currentTheme !== theme) {
			setTheme(theme);
			currentTheme = theme;
		} else {
			setTheme('');
			currentTheme = null;
		}
	};

	onMount(() => {
		currentTheme = loadTheme();
	});
</script>

<div class="dropdown dropdown-top">
	<button tabindex="-1" class="btn btn-accent m-1 uppercase"><slot></slot></button>
	<div class="dropdown-content h-[70vh] w-52 overflow-y-auto rounded bg-base-200">
		<div class="grid grid-cols-1 gap-3 p-3">
			{#each themes as theme (theme)}
				<button on:click={() => handleSetTheme(theme)}>
					<ThemeExample {theme} />
				</button>
			{/each}
		</div>
	</div>
</div>
