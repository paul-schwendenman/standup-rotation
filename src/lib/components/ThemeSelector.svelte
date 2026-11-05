<script lang="ts">
	import ThemeExample from './ThemeExample.svelte';
	import { onMount } from 'svelte';
	import { setTheme, loadTheme } from '../utils';
	import { themes, type Theme } from '#lib/types.ts';
	import {
		aiPrompt,
		injectCustomThemes,
		isCustomThemeId,
		loadCustomThemes,
		parseTheme,
		saveCustomThemes,
		themeId,
		type CustomTheme,
		type CustomThemeId
	} from '#lib/customTheme.ts';

	let currentTheme: Theme | CustomThemeId | null = null;
	let customThemes: CustomTheme[] = [];
	let tab: 'built-in' | 'custom' = 'built-in';
	let source = '';
	let copied = false;

	$: result = parseTheme(source);

	const handleSetTheme = (theme: Theme | CustomThemeId) => {
		if (currentTheme !== theme) {
			setTheme(theme);
			currentTheme = theme;
		} else {
			setTheme('');
			currentTheme = null;
		}
	};

	const storeCustomThemes = (updated: CustomTheme[]) => {
		customThemes = updated;
		saveCustomThemes(customThemes);
		injectCustomThemes(customThemes);
	};

	const handleSourceInput = () => {
		const { theme } = parseTheme(source);
		if (!theme) return;

		storeCustomThemes([...customThemes.filter((t) => t.name !== theme.name), theme]);
		setTheme(themeId(theme.name));
		currentTheme = themeId(theme.name);
	};

	const handleSelectCustom = (theme: CustomTheme) => {
		handleSetTheme(themeId(theme.name));
		source = currentTheme ? theme.source : '';
	};

	const handleRemoveCustom = (theme: CustomTheme) => {
		storeCustomThemes(customThemes.filter((t) => t.name !== theme.name));
		if (currentTheme === themeId(theme.name)) {
			setTheme('');
			currentTheme = null;
			source = '';
		}
	};

	const copyPrompt = async () => {
		await navigator.clipboard.writeText(aiPrompt);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	};

	onMount(() => {
		customThemes = loadCustomThemes();
		injectCustomThemes(customThemes);
		currentTheme = loadTheme();

		if (isCustomThemeId(currentTheme)) {
			tab = 'custom';
			source = customThemes.find((t) => themeId(t.name) === currentTheme)?.source ?? '';
		}
	});
</script>

<div class="dropdown dropdown-top">
	<button tabindex="-1" class="btn m-1 uppercase btn-accent"><slot></slot></button>
	<div class="dropdown-content flex h-[70vh] w-80 flex-col rounded-sm bg-base-200">
		<div role="tablist" class="tabs tabs-box m-3 mb-0 grid grid-cols-2">
			<button
				role="tab"
				class="tab"
				class:tab-active={tab === 'built-in'}
				aria-selected={tab === 'built-in'}
				on:click={() => (tab = 'built-in')}>Built-in</button
			>
			<button
				role="tab"
				class="tab"
				class:tab-active={tab === 'custom'}
				aria-selected={tab === 'custom'}
				on:click={() => (tab = 'custom')}>Custom</button
			>
		</div>

		<div class="overflow-y-auto">
			{#if tab === 'built-in'}
				<div class="grid grid-cols-1 gap-3 p-3">
					{#each themes as theme (theme)}
						<button on:click={() => handleSetTheme(theme)}>
							<ThemeExample {theme} />
						</button>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col gap-3 p-3 text-sm">
					{#each customThemes as theme (theme.name)}
						<div class="flex items-center gap-2">
							<button class="grow" on:click={() => handleSelectCustom(theme)}>
								<ThemeExample theme={themeId(theme.name)} label={theme.name} />
							</button>
							<button
								class="btn btn-square btn-ghost btn-sm"
								aria-label="Remove {theme.name}"
								on:click={() => handleRemoveCustom(theme)}>✕</button
							>
						</div>
					{/each}

					<p>
						Paste a daisyUI theme. It applies as soon as it's valid and is saved in this browser.
					</p>

					<details class="rounded-box bg-base-100 p-3">
						<summary class="cursor-pointer font-semibold">Don't have one? Ask an AI</summary>
						<ol class="mt-2 list-decimal space-y-1 pl-5">
							<li>Copy the prompt into ChatGPT, Claude or similar.</li>
							<li>Swap the bracketed part for the look you want.</li>
							<li>Paste its reply below. Extra text is ignored.</li>
						</ol>
						<div class="mt-3 flex flex-wrap items-center gap-2">
							<button class="btn btn-neutral btn-sm" on:click={copyPrompt}>
								{copied ? 'Copied' : 'Copy AI prompt'}
							</button>
							<a
								class="link text-xs"
								href="https://daisyui.com/theme-generator/"
								target="_blank"
								rel="noreferrer">or use the theme generator</a
							>
						</div>
					</details>

					<label class="flex flex-col gap-1">
						<span class="font-semibold">Theme CSS</span>
						<textarea
							bind:value={source}
							on:input={handleSourceInput}
							class="textarea h-48 w-full font-mono text-xs"
							class:textarea-error={result.errors.length > 0}
							spellcheck="false"
							placeholder={'@plugin "daisyui/theme" { … }'}></textarea>
					</label>

					{#if source.trim() !== ''}
						<div
							role="status"
							class="alert flex-col items-start alert-soft"
							class:alert-success={result.theme}
							class:alert-error={!result.theme}
						>
							{#if result.theme}
								<span class="font-semibold">Applied “{result.theme.name}”</span>
							{:else}
								<span class="font-semibold">
									Not applied: {result.errors.length}
									{result.errors.length === 1 ? 'problem' : 'problems'}
								</span>
								<ul class="list-disc pl-5">
									{#each result.errors as error (error)}
										<li>{error}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}

					{#if result.warnings.length > 0}
						<ul class="list-disc pl-5 text-xs opacity-75">
							{#each result.warnings as warning (warning)}
								<li>{warning}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
