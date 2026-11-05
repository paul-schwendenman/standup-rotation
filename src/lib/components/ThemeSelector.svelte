<script lang="ts">
	import ThemeExample from './ThemeExample.svelte';
	import { onMount, tick } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { applyTheme, setTheme, loadTheme } from '../utils';
	import { themes, type Setting, type Theme } from '#lib/types.ts';
	import {
		TEAM_THEME_ID,
		aiPrompt,
		injectCustomThemes,
		loadCustomThemes,
		parseTheme,
		saveCustomThemes,
		themeId,
		toSource,
		type CustomTheme,
		type CustomThemeId
	} from '#lib/customTheme.ts';

	export let settings: Writable<Setting>;

	// The theme this person picked; when unset, the team theme from the link applies.
	let currentTheme: Theme | CustomThemeId | null = null;
	let mounted = false;
	let customThemes: CustomTheme[] = [];
	let tab: 'themes' | 'create' = 'themes';
	let source = '';
	let copied = false;
	let copyFailed = false;
	let promptEl: HTMLTextAreaElement;
	// The theme this Create session is saving to, so edits to it aren't reported as replacing it.
	let sessionName: string | null = null;
	let replaced: string | null = null;

	$: result = parseTheme(source);
	$: teamTheme = $settings.theme ? parseTheme($settings.theme).theme : null;
	$: if (mounted) {
		injectCustomThemes(customThemes, teamTheme);
		applyTheme(currentTheme || (teamTheme ? TEAM_THEME_ID : ''));
	}

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
	};

	const handleSourceInput = () => {
		if (source.trim() === '') sessionName = null;

		const { theme } = parseTheme(source);
		if (!theme) return;

		if (theme.name !== sessionName) {
			replaced = customThemes.some((t) => t.name === theme.name) ? theme.name : null;
			sessionName = theme.name;
		}

		storeCustomThemes([...customThemes.filter((t) => t.name !== theme.name), theme]);
		setTheme(themeId(theme.name));
		currentTheme = themeId(theme.name);
	};

	const handleEditCustom = (theme: CustomTheme) => {
		source = theme.source;
		sessionName = theme.name;
		replaced = null;
		tab = 'create';
	};

	const handleRemoveCustom = (theme: CustomTheme) => {
		storeCustomThemes(customThemes.filter((t) => t.name !== theme.name));
		if (currentTheme === themeId(theme.name)) {
			setTheme('');
			currentTheme = null;
		}
		if (result.theme?.name === theme.name) {
			source = '';
		}
	};

	const handleUseForTeam = (theme: CustomTheme) => {
		settings.update((s) => ({ ...s, theme: toSource(theme) }));
	};

	const handleUseTeamTheme = () => {
		setTheme('');
		currentTheme = null;
	};

	const handleClearTeamTheme = () => {
		settings.update((s) => ({ ...s, theme: undefined }));
	};

	const copyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(aiPrompt);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			copyFailed = true;
			await tick();
			promptEl.select();
		}
	};

	onMount(() => {
		customThemes = loadCustomThemes();
		currentTheme = loadTheme();
		mounted = true;
	});
</script>

<div class="dropdown dropdown-top">
	<button tabindex="-1" class="btn m-1 uppercase btn-accent"><slot></slot></button>
	<div class="dropdown-content flex h-[70vh] w-80 flex-col rounded-sm bg-base-200">
		<div role="tablist" class="tabs tabs-box m-3 mb-0 grid grid-cols-2">
			<button
				role="tab"
				class="tab"
				class:tab-active={tab === 'themes'}
				aria-selected={tab === 'themes'}
				on:click={() => (tab = 'themes')}>Themes</button
			>
			<button
				role="tab"
				class="tab"
				class:tab-active={tab === 'create'}
				aria-selected={tab === 'create'}
				on:click={() => (tab = 'create')}>Create</button
			>
		</div>

		<div class="overflow-y-auto">
			{#if tab === 'themes'}
				<div class="grid grid-cols-1 gap-3 p-3">
					{#if teamTheme}
						<h3 class="text-xs font-bold tracking-wider uppercase opacity-70">Team</h3>
						<div class="flex items-center gap-1">
							<button class="grow" aria-pressed={!currentTheme} on:click={handleUseTeamTheme}>
								<ThemeExample theme={TEAM_THEME_ID} label={teamTheme.name} active={!currentTheme} />
							</button>
							<button
								class="btn btn-square btn-ghost btn-sm"
								aria-label="Stop using {teamTheme.name} for this team"
								on:click={handleClearTeamTheme}>✕</button
							>
						</div>
						<p class="text-xs opacity-70">
							Saved in this page's link. It applies for anyone who hasn't picked their own theme.
						</p>
					{/if}
					{#if customThemes.length > 0}
						<h3 class="text-xs font-bold tracking-wider uppercase opacity-70">Custom</h3>
						{#each customThemes as theme (theme.name)}
							<div class="flex items-center gap-1">
								<button
									class="grow"
									aria-pressed={currentTheme === themeId(theme.name)}
									on:click={() => handleSetTheme(themeId(theme.name))}
								>
									<ThemeExample
										theme={themeId(theme.name)}
										label={theme.name}
										active={currentTheme === themeId(theme.name)}
									/>
								</button>
								<button
									class="btn btn-square btn-ghost btn-sm"
									aria-label="Use {theme.name} for this team"
									title="Use for this team"
									on:click={() => handleUseForTeam(theme)}
								>
									<svg
										class="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
										><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle
											cx="17"
											cy="9"
											r="2.5"
										/><path d="M15.5 14.2A5 5 0 0 1 21 19" /></svg
									>
								</button>
								<button
									class="btn btn-square btn-ghost btn-sm"
									aria-label="Edit {theme.name}"
									on:click={() => handleEditCustom(theme)}>✎</button
								>
								<button
									class="btn btn-square btn-ghost btn-sm"
									aria-label="Remove {theme.name}"
									on:click={() => handleRemoveCustom(theme)}>✕</button
								>
							</div>
						{/each}
					{/if}
					{#if teamTheme || customThemes.length > 0}
						<h3 class="text-xs font-bold tracking-wider uppercase opacity-70">Built-in</h3>
					{/if}
					{#each themes as theme (theme)}
						<button aria-pressed={currentTheme === theme} on:click={() => handleSetTheme(theme)}>
							<ThemeExample {theme} active={currentTheme === theme} />
						</button>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col gap-3 p-3 text-sm">
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
						{#if copyFailed}
							<p class="mt-3">Couldn't copy automatically. Select the text below and copy it.</p>
							<textarea
								bind:this={promptEl}
								readonly
								class="textarea mt-1 h-40 w-full font-mono text-xs"
								aria-label="AI prompt">{aiPrompt}</textarea
							>
						{/if}
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
								{#if replaced === result.theme.name}
									<span>Replaced your earlier “{result.theme.name}” theme.</span>
								{:else}
									<span>Saved to your themes.</span>
								{/if}
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
