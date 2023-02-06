<script>
	import { writable } from "svelte/store";

	export let showTimer = writable(true);
	export let duration = writable("1:00");
	export let welcome = writable("Welcome!")
</script>

<div>
	<label>
		<span>Show timer:</span>
		<input bind:checked={$showTimer} type="checkbox" class="toggle" />
	</label>

	<label>
		<span>Duration:</span>
		<input bind:value={$duration} type="text" class="input input-bordered" disabled={!($showTimer)} />
	</label>

	<label>
		<span>Welcome message:</span>
		<input bind:value={$welcome} type="text" class="input input-bordered" />
	</label>
</div>

<style>
	label {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
</style>
