<script lang="ts">
	import { writable } from 'svelte/store';
	import EditNames from './EditNames.svelte';
	import type { Writable } from 'svelte/store';
	import type { Setting } from '#lib/types.ts';

	export let settings: Writable<Setting> = writable({
		welcome: '',
		done: '',
		duration: '1:00',
		showTimer: true,
		names: []
	});

	$: validDuration = new RegExp('^[0-9]+:[0-5][0-9]$').test($settings.duration);
	$: validWelcome = $settings.welcome.length > 0;
	$: validDone = $settings.done.length > 0;
</script>

<div>
	<label class="inline">
		<span>Enable timer:</span>
		<input bind:checked={$settings.showTimer} type="checkbox" class="toggle" />
	</label>

	<label>
		<span>Duration:</span>
		<input
			bind:value={$settings.duration}
			type="text"
			class="input w-full"
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
			class="input w-full"
			class:input-error={!validWelcome}
			placeholder="Message shown at beginning"
		/>
	</label>

	<label>
		<span>Done message:</span>
		<input
			bind:value={$settings.done}
			type="text"
			class="input w-full"
			class:input-error={!validDone}
			placeholder="Message to show at end of rotation"
		/>
	</label>

	<EditNames bind:names={$settings.names} />
</div>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	label.inline {
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
</style>
