<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { ChevronDownIcon, Plus, X } from '@lucide/svelte/icons';
	import PrSelect from '$lib/components/pr-select.svelte';
	import PrOverview from '$lib/components/pr-overview.svelte';
	import type { SearchIssue } from '$lib/github';
	import Button from './ui/button/button.svelte';
	import Separator from './ui/separator/separator.svelte';

	export let repoFullName: string;

	type Tab = {
		id: string;
		pr: SearchIssue | null;
	};

	let tabs: Tab[] = [{ id: 'new', pr: null }];
	let activeTab = 'new';

	function openPrTab(pr: SearchIssue) {
		const id = pr.number.toString();
		if (!tabs.find((t) => t.id === id)) {
			tabs = [...tabs.filter((t) => t.id !== 'new'), { id, pr }, { id: 'new', pr: null }];
		}
		activeTab = id;
	}

	function closeTab(id: string) {
		tabs = tabs.filter((t) => t.id !== id);
		if (activeTab === id) {
			activeTab = tabs.length ? tabs[tabs.length - 1].id : 'new';
		}
	}
</script>

<div class="flex size-full">
	<Tabs.Root bind:value={activeTab} class="flex size-full flex-col items-center">
		<Tabs.List>
			<div class="mx-2">PRs:</div>
			{#each tabs as tab}
				<Tabs.Trigger value={tab.id} class={tab.id !== activeTab ? 'cursor-pointer' : ''}>
					{#if tab.pr}
						<span>#{tab.pr.number}</span>
						<button class="ml-2 cursor-pointer" on:click|stopPropagation={() => closeTab(tab.id)}
							><X size={14} /></button
						>
					{:else if tab.id === activeTab}
						<ChevronDownIcon size={16} />
					{:else}
						<Plus size={16} />
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
		<Separator class="my-2" />
		{#each tabs as tab}
			<Tabs.Content value={tab.id} class="flex h-0 min-h-0 w-full flex-grow flex-col items-center">
				{#if tab.pr}
					<PrOverview pr={tab.pr} {repoFullName} />
				{:else}
					<p class="mb-4 text-2xl font-light">Select a pull request</p>
					<PrSelect {repoFullName} onSelect={(pr) => openPrTab(pr)} />
				{/if}
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
