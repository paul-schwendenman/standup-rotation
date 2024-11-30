<script>
	import { writable } from 'svelte/store';
	import EditNames from './EditNames.svelte';

	export let settings = writable({
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
