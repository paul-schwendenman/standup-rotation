<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		SIZE,
		STRENGTH,
		checkSvg,
		defaultBackground,
		presetIds,
		presets,
		svgUrl,
		type Layout,
		type PresetId,
		type ThemeBackground
	} from '#lib/background.ts';

	export let background: ThemeBackground | null;
	// The last background made with Create, so picking a preset doesn't lose it.
	export let yours: ThemeBackground | null = null;

	const dispatch = createEventDispatcher<{ change: ThemeBackground | null; create: void }>();

	let layoutError = '';
	let adjustOpen = false;

	$: layout = background?.layout ?? 'tile';

	const update = (patch: Partial<ThemeBackground>) => {
		if (background) dispatch('change', { ...background, ...patch });
	};

	const pickPreset = (id: PresetId | null) => {
		layoutError = '';
		if (!id) {
			dispatch('change', null);
			return;
		}
		const base = background ?? defaultBackground(id);
		dispatch('change', { ...base, pattern: id, layout: presets[id].layout, svg: undefined });
	};

	const setLayout = (next: Layout) => {
		layoutError = '';
		if (background?.pattern === 'custom' && !checkSvg(background.svg ?? '', next).svg) {
			layoutError = 'This SVG is too big to tile (max 8 KB).';
			return;
		}
		update({ layout: next });
	};

	const tileSize = (id: PresetId) => (presets[id].layout === 'full' ? 'cover' : '18px 18px');
	const tileRepeat = (id: PresetId) => (presets[id].layout === 'full' ? 'no-repeat' : 'repeat');
</script>

<section class="flex flex-col gap-3" aria-labelledby="background-title">
	<h3 id="background-title" class="text-xs font-bold tracking-wider uppercase opacity-70">
		Background
	</h3>
	<button class="btn w-full" on:click={() => dispatch('create')}>
		<svg
			class="size-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg
		>
		Create a background
	</button>
	<div role="radiogroup" aria-label="Background pattern" class="grid grid-cols-3 gap-3">
		<button
			role="radio"
			aria-checked={!background}
			class="flex flex-col items-center gap-1 text-sm"
			on:click={() => pickPreset(null)}
		>
			<span
				class="block aspect-[16/10] w-full rounded-field bg-base-100 outline-offset-1 outline-primary"
				class:outline-2={!background}
			></span>
			None
		</button>
		{#each presetIds as id (id)}
			<button
				role="radio"
				aria-checked={background?.pattern === id}
				class="flex flex-col items-center gap-1 text-sm"
				on:click={() => pickPreset(id)}
			>
				<span
					class="relative block aspect-[16/10] w-full overflow-hidden rounded-field bg-base-100 outline-offset-1 outline-primary"
					class:outline-2={background?.pattern === id}
				>
					<span
						class="absolute inset-0 bg-base-content/50"
						style:mask="{svgUrl(presets[id].svg)} center bottom / {tileSize(id)}
						{tileRepeat(id)}"
					></span>
				</span>
				{presets[id].label}
			</button>
		{/each}
		{#if yours}
			<button
				role="radio"
				aria-checked={background?.pattern === 'custom'}
				class="flex flex-col items-center gap-1 text-sm"
				on:click={() => dispatch('change', yours)}
			>
				<span
					class="relative block aspect-[16/10] w-full overflow-hidden rounded-field bg-base-100 outline-offset-1 outline-primary"
					class:outline-2={background?.pattern === 'custom'}
				>
					<span
						class="absolute inset-0 bg-base-content/50"
						style:mask="{svgUrl(yours.svg ?? '')} center bottom / {yours.layout === 'full'
							? 'cover'
							: '18px 18px'}
						{yours.layout === 'full' ? 'no-repeat' : 'repeat'}"
					></span>
				</span>
				Yours
			</button>
		{/if}
	</div>

	{#if background}
		<details class="rounded-box bg-base-100 p-3 text-sm" bind:open={adjustOpen}>
			<summary class="cursor-pointer font-semibold">Adjust background</summary>
			<div class="mt-3 flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<span id="bg-layout">Layout</span>
					<div role="radiogroup" aria-labelledby="bg-layout" class="join grid grid-cols-2">
						<button
							role="radio"
							aria-checked={layout === 'tile'}
							class="btn join-item"
							class:btn-active={layout === 'tile'}
							on:click={() => setLayout('tile')}>Tile</button
						>
						<button
							role="radio"
							aria-checked={layout === 'full'}
							class="btn join-item"
							class:btn-active={layout === 'full'}
							on:click={() => setLayout('full')}>Full screen</button
						>
					</div>
					{#if layoutError}
						<p class="text-xs text-error">{layoutError}</p>
					{/if}
				</div>

				{#if layout === 'tile'}
					<label class="flex flex-col gap-1">
						<span class="flex justify-between">
							<span>Tile size</span><span class="opacity-75">{background.size} px</span>
						</span>
						<input
							type="range"
							class="range w-full range-sm"
							min={SIZE.min}
							max={SIZE.max}
							step="4"
							value={background.size}
							on:input={(e) => update({ size: Number(e.currentTarget.value) })}
						/>
					</label>
				{:else}
					<div class="flex flex-col gap-1">
						<span id="bg-position">Position</span>
						<div role="radiogroup" aria-labelledby="bg-position" class="join grid grid-cols-3">
							{#each ['top', 'center', 'bottom'] as const as position (position)}
								<button
									role="radio"
									aria-checked={background.position === position}
									class="btn join-item capitalize"
									class:btn-active={background.position === position}
									on:click={() => update({ position })}>{position}</button
								>
							{/each}
						</div>
						<span class="text-xs opacity-75"
							>Scaled to cover the screen; this edge stays in view.</span
						>
					</div>
				{/if}

				<label class="flex flex-col gap-1">
					<span class="flex justify-between">
						<span>Strength</span><span class="opacity-75">{background.strength}%</span>
					</span>
					<input
						type="range"
						class="range w-full range-sm"
						min={STRENGTH.min}
						max={STRENGTH.max}
						value={background.strength}
						on:input={(e) => update({ strength: Number(e.currentTarget.value) })}
					/>
				</label>

				<div class="flex flex-col gap-1">
					<span id="bg-colors">Colors</span>
					<div role="radiogroup" aria-labelledby="bg-colors" class="join grid grid-cols-2">
						<button
							role="radio"
							aria-checked={background.mode === 'tint'}
							class="btn join-item"
							class:btn-active={background.mode === 'tint'}
							on:click={() => update({ mode: 'tint' })}>Match theme</button
						>
						<button
							role="radio"
							aria-checked={background.mode === 'original'}
							class="btn join-item"
							class:btn-active={background.mode === 'original'}
							on:click={() => update({ mode: 'original' })}>Original colors</button
						>
					</div>
					<span class="text-xs opacity-75">
						{background.mode === 'tint'
							? 'Uses only the shape, colored from the theme, so it stays readable.'
							: "Uses the SVG's own colors, faded by Strength. Can clash with the theme."}
					</span>
				</div>
			</div>
		</details>
	{/if}
</section>
