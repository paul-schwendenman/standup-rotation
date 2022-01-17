<script>
	import { writable } from "svelte/store";

	export let showTimer = writable(true);
	export let duration = writable("1:00");
</script>

<div>
	<label>
		<input bind:checked={$showTimer} type="checkbox" class="toggle" />
		Show timer
	</label>

	<label>
		<input bind:value={$duration} type="text" class="input input-bordered" disabled={!($showTimer)} />
		Duration
	</label>
</div>

<style>
	label {
		display: block;
	}
</style>