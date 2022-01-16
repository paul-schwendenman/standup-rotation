<script>
import { onMount } from 'svelte';

	import { persistable } from './stores';

	const names = persistable('names', ['paul', 'tyler']);
	const hiddenNames = [];
	const welcome = persistable('welcome', 'welcome');
	let started = false;
	let currentName;
	$: nextName = $names[0];
	let newName;
	let activeNames;

	const addName = () => {
		names.update(names => [...names, newName]);
		newName = '';
	};

	const removeName = (name) => {
		return () => {
			names.update(names => names.filter(item => item !== name))
		}
	}

	onMount(() => {
		activeNames = [...$names];
	});

	const start = () => {
		started = true;
		currentName = activeNames.shift();
	}
</script>

<main class="m-auto max-w-sm">
	{#if !started}
		<span class="text-7xl">{$welcome}</span>
		<span class="text-2xl text-base-200">{nextName}</span>
		<!-- <button class="btn btn-ghost btn-sm">Shuffle</button> -->
		<button on:click={start} class="btn btn-primary btn-wide btn-lg m-auto">Start</button>
	{:else}
		<span class="text-7xl">{currentName}</span>
		<span class="text-2xl text-base-200">{nextName}</span>

		<button class="btn btn-primary">Next</button>
		<button class="btn btn-outline btn-secondary">Skip</button>

		<button on:click={() => started = false} class="btn btn-xs btn-ghost">reset</button>
	{/if}

	<div class="names">
		{#each $names as name (name)}
			<div class="name">
				<!-- <input bind:value={name in hiddenNames} type="checkbox" class="toggle" /> -->

				<span>{name}</span>
				<button on:click={removeName(name)}>Remove</button>
			</div>
		{/each}
		<div class="addName">
			<input bind:value={newName} class="input" type="text" placeholder="name"/>
			<button on:click={addName} class="btn btn-ghost">Add</button>
		</div>
	</div>
</main>

<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>

