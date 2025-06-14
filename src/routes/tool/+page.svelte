<script lang="ts">
	import DarkModeToggle from '$lib/components/dark-mode-toggle.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import RepoSelect from '$lib/components/repo-select.svelte';
	import type RepoSuggestion from '$lib/components/repo-select.svelte';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import PrTabs from '$lib/components/pr-tabs.svelte';
	import { goto } from '$app/navigation';

	let selectedRepo: RepoSuggestion | null = null;
</script>

<div class="flex flex-row justify-between">
	<div class="flex h-12 w-24 flex-shrink-0 items-center">
		<button onclick={() => goto('/')} class="cursor-pointer">
			<img src="/pr-peer.png" alt="Logo" class="-ml-2" />
		</button>
	</div>
	<DarkModeToggle />
</div>

<Separator class="my-4" />

{#if selectedRepo}
	<div class="flex flex-grow flex-col">
		<button
			type="button"
			class="absolute h-9 cursor-pointer border-none bg-transparent p-0 select-none"
			onclick={() => (selectedRepo = null)}
		>
			<div class="flex items-center gap-2">
				<ArrowLeftIcon class="h-5 w-5" />
				<span class="font-bold text-nowrap">{selectedRepo.full_name}</span>
			</div>
		</button>
		<PrTabs repoFullName={selectedRepo.full_name} />
	</div>
{:else}
	<div class="mt-16 flex flex-grow flex-col items-center">
		<p class="mb-4 text-2xl font-light">Select a repository</p>
		<RepoSelect bind:selectedRepo />
	</div>
{/if}
