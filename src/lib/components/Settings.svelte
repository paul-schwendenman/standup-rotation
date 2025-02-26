<script lang="ts">
	import { writable } from 'svelte/store';
	import EditNames from './EditNames.svelte';
	import type { Writable } from 'svelte/store';
	import type { Setting } from '$lib/types';

	interface Props {
		settings?: Writable<Setting>;
	}

	let { settings = writable({
		welcome: '',
		done: '',
		duration: '1:00',
		showTimer: true,
		names: []
	}) }: Props = $props();

	let validDuration = $derived(new RegExp('^[0-9]+:[0-5][0-9]$').test($settings.duration));
	let validWelcome = $derived($settings.welcome.length > 0);
	let validDone = $derived($settings.done.length > 0);
</script>

<div>
	<label>
		<span>Enable timer:</span>
		<input bind:checked={$settings.showTimer} type="checkbox" class="toggle" />
	</label>

	<label>
		<span>Duration:</span>
		<input
			bind:value={$settings.duration}
			type="text"
			class="input input-bordered"
			pattern="^[0-9]+:[0-5][0-9]$"
			class:input-error={!validDuration}
			disabled={!$settings.showTimer}
		/>
	</label>

	<label>
		<span>Welcome message:</span>
		<input
			bind:value={$settings.welcome}
			type="text"
			class="input input-bordered"
			class:input-error={!validWelcome}
			placeholder="Message shown at beginning"
		/>
	</label>

	<label>
		<span>Done message:</span>
		<input
			bind:value={$settings.done}
			type="text"
			class="input input-bordered"
			class:input-error={!validDone}
			placeholder="Message to show at end of rotation"
		/>
	</label>

	<EditNames bind:names={$settings.names} />
</div>

<style>
	label {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
</style>
