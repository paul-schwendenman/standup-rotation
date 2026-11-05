<script lang="ts">
	import ThemeExample from './ThemeExample.svelte';
	import BackgroundEditor from './BackgroundEditor.svelte';
	import CopyButton from './CopyButton.svelte';
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { Writable } from 'svelte/store';
	import { applyTheme, setTheme, loadTheme } from '../utils';
	import { themes, type Setting, type Theme } from '#lib/types.ts';
	import {
		TEAM_THEME_ID,
		aiPrompt,
		injectCustomThemes,
		loadCustomThemes,
		parseTeamSetting,
		parseTheme,
		saveCustomThemes,
		themeId,
		toTeamSetting,
		type CustomTheme,
		type CustomThemeId
	} from '#lib/customTheme.ts';

	export let settings: Writable<Setting>;

	// The theme this person picked; when unset, the team theme from the link applies.
	let currentTheme: Theme | CustomThemeId | null = null;
	let mounted = false;
	let customThemes: CustomTheme[] = [];
	// The Create sheet sits beside the rotation so the page behind it is the live preview.
	let creating = false;
	let trigger: HTMLButtonElement;
	let sourceEl: HTMLTextAreaElement;
	let reduceMotion = false;
	let source = '';
	// The theme this Create session is saving to, so edits to it aren't reported as replacing it.
	let sessionName: string | null = null;
	let replaced: string | null = null;

	$: result = parseTheme(source);
	$: editingTheme = result.theme && customThemes.find((t) => t.name === result.theme?.name);
	$: teamTheme = parseTeamSetting($settings.theme);
	$: teamDroppedBackground =
		!!teamTheme &&
		!teamTheme.background &&
		!!customThemes.find((t) => t.name === teamTheme.name)?.background;
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

		// Re-pasting the colors keeps the background chosen for this theme.
		const background = customThemes.find((t) => t.name === theme.name)?.background;
		storeCustomThemes([
			...customThemes.filter((t) => t.name !== theme.name),
			background ? { ...theme, background } : theme
		]);
		setTheme(themeId(theme.name));
		currentTheme = themeId(theme.name);
	};

	const openCreate = async () => {
		creating = true;
		await tick();
		sourceEl.focus();
	};

	const closeCreate = () => {
		creating = false;
		trigger.focus();
	};

	const handleEditCustom = (theme: CustomTheme) => {
		source = theme.source;
		sessionName = theme.name;
		replaced = null;
		openCreate();
	};

	// daisyUI dropdowns stay open while focus is inside, so Escape has to move focus out.
	const handleDropdownKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
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

	const handleBackgroundChange = (event: CustomEvent<CustomTheme['background']>) => {
		if (!editingTheme) return;
		const name = editingTheme.name;
		storeCustomThemes(
			customThemes.map((t) => (t.name === name ? { ...t, background: event.detail } : t))
		);
	};

	const handleUseForTeam = (theme: CustomTheme) => {
		settings.update((s) => ({ ...s, theme: toTeamSetting(theme) }));
	};

	const handleUseTeamTheme = () => {
		setTheme('');
		currentTheme = null;
	};

	const handleClearTeamTheme = () => {
		settings.update((s) => ({ ...s, theme: undefined }));
	};

	onMount(() => {
		customThemes = loadCustomThemes();
		currentTheme = loadTheme();
		reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		mounted = true;
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="dropdown dropdown-top" on:keydown={handleDropdownKeydown}>
	<button bind:this={trigger} tabindex="0" class="btn m-1 uppercase btn-accent"
		><slot></slot></button
	>
	<!-- No display utility here: it would beat daisyUI's display:none and leave the closed panel clickable. -->
	<div class="dropdown-content w-80 rounded-box bg-base-200">
		<div class="max-h-[70vh] overflow-y-auto">
			<div class="grid grid-cols-1 gap-3 p-3">
				<button class="btn w-full btn-neutral" on:click={openCreate}>
					<svg
						class="size-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg
					>
					Create a theme
				</button>
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
					{#if teamDroppedBackground}
						<p class="text-xs opacity-70">
							The background was too big to share. The team gets {teamTheme.name}'s colors only.
						</p>
					{/if}
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
		</div>
	</div>
</div>

{#if creating}
	<div
		role="dialog"
		tabindex="-1"
		aria-labelledby="create-theme-title"
		class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-base-300 bg-base-200 text-base-content"
		transition:fly={{ x: 48, duration: reduceMotion ? 0 : 320, easing: expoOut }}
		on:keydown={(e) => e.key === 'Escape' && closeCreate()}
	>
		<header class="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-3">
			<h2 id="create-theme-title" class="text-lg font-semibold">Create a theme</h2>
			<button class="btn btn-square btn-ghost" aria-label="Close" on:click={closeCreate}>
				<svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
				>
			</button>
		</header>

		<div class="flex flex-col gap-8 overflow-y-auto px-5 pt-5 pb-8">
			<section class="flex flex-col gap-3" aria-labelledby="theme-colors-title">
				<h3 id="theme-colors-title" class="text-xs font-bold tracking-wider uppercase opacity-70">
					Colors
				</h3>
				<p>Paste a daisyUI theme. It applies as soon as it's valid and is saved in this browser.</p>

				<details class="rounded-box bg-base-100 p-3 text-sm">
					<summary class="cursor-pointer font-semibold">Don't have one? Ask an AI</summary>
					<ol class="mt-2 list-decimal space-y-1 pl-5">
						<li>Copy the prompt into ChatGPT, Claude or similar.</li>
						<li>Swap the bracketed part for the look you want.</li>
						<li>Paste its reply below. Extra text is ignored.</li>
					</ol>
					<div class="mt-3 flex flex-wrap items-center gap-3">
						<CopyButton text={aiPrompt} label="Copy AI prompt" />
						<a
							class="link text-sm"
							href="https://daisyui.com/theme-generator/"
							target="_blank"
							rel="noreferrer">or use the theme generator</a
						>
					</div>
				</details>

				<label class="flex flex-col gap-1">
					<span class="text-sm font-semibold">Theme CSS</span>
					<textarea
						bind:this={sourceEl}
						bind:value={source}
						on:input={handleSourceInput}
						class="textarea h-44 w-full font-mono text-xs whitespace-pre"
						class:textarea-error={result.errors.length > 0}
						wrap="off"
						spellcheck="false"
						placeholder={'@plugin "daisyui/theme" { … }'}></textarea>
				</label>

				{#if source.trim() !== ''}
					<div
						role="status"
						class="alert flex flex-col items-start gap-1 alert-soft"
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
					<ul class="list-disc pl-5 text-sm opacity-75">
						{#each result.warnings as warning (warning)}
							<li>{warning}</li>
						{/each}
					</ul>
				{/if}
			</section>

			{#key editingTheme?.name}
				<BackgroundEditor
					background={editingTheme?.background}
					disabled={!editingTheme}
					on:change={handleBackgroundChange}
				/>
			{/key}
		</div>
	</div>
{/if}
