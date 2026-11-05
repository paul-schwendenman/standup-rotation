<script lang="ts">
	import type { Person } from '#lib/types.ts';

	export let names: Person[] = [];

	let newName = '';

	function addName() {
		const name = newName.trim();
		if (!name) return;
		names = [...names, { name, active: true }];

		newName = '';
	}

	function removeItem(index: number) {
		return () => {
			names.splice(index, 1);
			names = names;
		};
	}

	function handleUpdate() {
		return () => {
			names = [...names];
		};
	}
</script>

<fieldset>
	<legend class="mb-1">Names:</legend>
	{#each names as name, index (index)}
		<div class="mb-1 flex items-center gap-2">
			<input
				class="checkbox"
				bind:checked={name.active}
				type="checkbox"
				aria-label="Include {name.name} in the rotation"
				on:change={handleUpdate()}
			/>
			<input
				class="input grow input-ghost"
				class:inactive={!name.active}
				bind:value={name.name}
				aria-label="Name"
				disabled={!name.active}
				on:change={handleUpdate()}
			/>
			<button class="btn btn-circle" aria-label="Remove {name.name}" on:click={removeItem(index)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/></svg
				>
			</button>
		</div>
	{/each}

	<form class="mt-2 flex gap-2" on:submit|preventDefault={addName}>
		<input
			type="text"
			bind:value={newName}
			placeholder="name"
			aria-label="New name"
			class="input grow"
		/>
		<button class="btn uppercase" disabled={!newName.trim()}>Add</button>
	</form>
</fieldset>

<style>
	.inactive {
		text-decoration: line-through;
	}
</style>
