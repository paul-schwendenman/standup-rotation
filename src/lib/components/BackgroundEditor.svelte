<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CopyButton from './CopyButton.svelte';
	import {
		SHARE_MAX_BYTES,
		SIZE,
		STRENGTH,
		checkSvg,
		defaultBackground,
		fullPrompt,
		presetIds,
		presets,
		svgBytes,
		svgUrl,
		tilePrompt,
		type Layout,
		type PresetId,
		type ThemeBackground
	} from '#lib/background.ts';

	export let background: ThemeBackground | undefined;
	// Backgrounds are saved with a custom theme, so there's nothing to attach one to until one exists.
	export let disabled = false;

	const dispatch = createEventDispatcher<{ change: ThemeBackground | undefined }>();

	let svgText = background?.pattern === 'custom' ? (background.svg ?? '') : '';
	let layoutError = '';
	let customOpen = background?.pattern === 'custom';
	const svgPlaceholder = '<svg viewBox="0 0 40 40">…</svg>';

	$: layout = background?.layout ?? 'tile';
	$: svgCheck = svgText.trim() ? checkSvg(svgText, layout) : null;

	const update = (patch: Partial<ThemeBackground>) => {
		if (background) dispatch('change', { ...background, ...patch });
	};

	const pickPreset = (id: PresetId | null) => {
		layoutError = '';
		if (!id) {
			dispatch('change', undefined);
			return;
		}
		const base = background ?? defaultBackground(id);
		dispatch('change', { ...base, pattern: id, layout: presets[id].layout, svg: undefined });
	};

	const handleSvgInput = () => {
		const { svg } = checkSvg(svgText, layout);
		if (!svg) return;
		layoutError = '';
		dispatch('change', { ...(background ?? defaultBackground('dots')), pattern: 'custom', svg });
	};

	const setLayout = (next: Layout) => {
		layoutError = '';
		if (background?.pattern === 'custom' && !checkSvg(background.svg ?? '', next).svg) {
			layoutError = 'This SVG is too big to tile (max 8 KB).';
			return;
		}
		update({ layout: next });
	};

	const formatKb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

	const tileSize = (id: PresetId) => (presets[id].layout === 'full' ? 'cover' : '18px 18px');
	const tileRepeat = (id: PresetId) => (presets[id].layout === 'full' ? 'no-repeat' : 'repeat');
</script>

<section class="flex flex-col gap-3" aria-labelledby="background-title">
	<h3 id="background-title" class="text-xs font-bold tracking-wider uppercase opacity-70">
		Background
	</h3>
	{#if disabled}
		<p class="text-sm opacity-75">
			Backgrounds are saved with a custom theme. Paste one above, or pick Edit on one of your
			themes.
		</p>
	{/if}

	<fieldset class="contents" {disabled}>
		<div role="radiogroup" aria-label="Background pattern" class="grid grid-cols-3 gap-3">
			<button
				role="radio"
				aria-checked={!background}
				class="flex flex-col items-center gap-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
					class="flex flex-col items-center gap-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
		</div>

		{#if !disabled}
			<details class="rounded-box bg-base-100 p-3 text-sm" bind:open={customOpen}>
				<summary class="cursor-pointer font-semibold">Use your own SVG</summary>
				<p class="mt-2">
					{layout === 'full'
						? 'Ask an AI for a full-screen illustration, then paste the SVG.'
						: 'Ask an AI for a small seamless pattern, then paste the SVG.'}
					SVGs up to {SHARE_MAX_BYTES / 1024} KB are shared with your team too; bigger ones only show
					for you.
				</p>
				<div class="mt-2 flex flex-wrap items-center gap-2">
					<CopyButton
						text={layout === 'full' ? fullPrompt : tilePrompt}
						label={layout === 'full' ? 'Copy illustration prompt' : 'Copy pattern prompt'}
					/>
				</div>
				<label class="mt-2 flex flex-col gap-1">
					<span class="font-semibold">Pattern SVG</span>
					<textarea
						bind:value={svgText}
						on:input={handleSvgInput}
						class="textarea h-24 w-full font-mono text-xs"
						class:textarea-error={svgCheck && !svgCheck.svg}
						spellcheck="false"
						placeholder={svgPlaceholder}></textarea>
				</label>
				{#if svgCheck?.svg}
					{@const bytes = svgBytes(svgCheck.svg)}
					<p class="mt-2 text-xs" class:text-success={bytes <= SHARE_MAX_BYTES}>
						{bytes <= SHARE_MAX_BYTES
							? `✓ Small enough to share with your team (${formatKb(bytes)}).`
							: `Too big to share with your team (${formatKb(bytes)} of ${formatKb(SHARE_MAX_BYTES)} max). It will only show for you.`}
					</p>
				{/if}
				{#if svgCheck && !svgCheck.svg}
					<ul class="mt-2 list-disc pl-5 text-xs text-error">
						{#each svgCheck.errors as error (error)}
							<li>{error}</li>
						{/each}
					</ul>
				{/if}
			</details>
		{/if}

		{#if background}
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
		{/if}
	</fieldset>
</section>
