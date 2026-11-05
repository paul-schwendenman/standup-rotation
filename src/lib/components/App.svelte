<script lang="ts">
	import Standup from './Standup.svelte';
	import Settings from './Settings.svelte';
	import { urlHash } from '../stores';
	import { derived } from 'svelte/store';
	import ThemeSelector from './ThemeSelector.svelte';
	import GithubCorner from './GithubCorner.svelte';
	import Sheet from './Sheet.svelte';
	import CopyButton from './CopyButton.svelte';
	import type { Setting } from '#lib/types.ts';

	// const settings1 = persistable("settings", {
	//   welcome: "Welcome!",
	//   done: "Done.",
	//   duration: "1:00",
	//   showTimer: true,
	//   names: []
	// });

	const settings = urlHash<Setting>({
		welcome: 'Welcome!',
		done: 'Done.',
		duration: '1:00',
		showTimer: true,
		names: []
	});

	const namesList = derived(
		settings,
		($settings) => {
			return $settings.names.filter((item) => item.active).map((item) => item.name);
		},
		[]
	);

	let showSettings = true;
	let settingsOpen = false;
	let themeOpen = false;
	let settingsTrigger: HTMLButtonElement;

	// Every settings change rewrites the link, so this is always the link to put in the invite.
	$: link = $settings && location.href;

	function handleRunning() {
		showSettings = !showSettings;
		if (!showSettings) settingsOpen = false;
	}

	function toggleSettings() {
		themeOpen = false;
		settingsOpen = !settingsOpen;
		if (!settingsOpen) settingsTrigger.focus();
	}

	function closeSettings() {
		settingsOpen = false;
		settingsTrigger.focus();
	}
</script>

<GithubCorner />

<main class="mx-auto my-8 max-w-2xl p-2">
	<Standup
		names={$namesList}
		showTimer={$settings.showTimer}
		doneMessage={$settings.done}
		time={$settings.duration}
		welcome={$settings.welcome}
		on:running={handleRunning}
	/>
</main>
<footer class="fixed inset-x-0 bottom-0">
	<div class="mx-auto max-w-2xl p-2">
		<button
			bind:this={settingsTrigger}
			class="btn uppercase btn-secondary"
			disabled={!showSettings}
			aria-expanded={settingsOpen}
			aria-controls="settings-sheet"
			on:click={toggleSettings}
		>
			Settings
		</button>
		<ThemeSelector {settings} bind:open={themeOpen} on:open={() => (settingsOpen = false)}
			>Theme</ThemeSelector
		>
	</div>
</footer>

{#if settingsOpen}
	<Sheet id="settings-sheet" title="Settings" on:close={closeSettings}>
		<Settings {settings} />
		<svelte:fragment slot="footer">
			<p class="text-sm">
				Changes are saved in this page's link. Update the meeting invite so the team gets them.
			</p>
			<div><CopyButton text={link} label="Copy link" /></div>
		</svelte:fragment>
	</Sheet>
{/if}
