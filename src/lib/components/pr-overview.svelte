<script lang="ts">
	import type { SearchIssue } from '$lib/github';
	import Button from './ui/button/button.svelte';
	import { timeAgo } from '$lib/github';
	import { getContrastColor } from '$lib/utils/color';
	import SvelteMarkdown from 'svelte-markdown';

	export let pr: SearchIssue;
	export let repoFullName: string;
</script>

<div class="p-4">
	<Button
		class="h-6 font-mono font-bold hover:underline"
		variant="secondary"
		size="sm"
		onclick={(e) => {
			e.stopPropagation();
			window.open(`https://github.com/${repoFullName}/pull/${pr.number}`, '_blank', 'noopener');
		}}
	>
		#{pr.number}
	</Button>
	<span class="font-semibold">{pr.title}</span>
	<span class="ml-2 text-xs text-gray-500">{pr.created_at ? timeAgo(pr.created_at) : ''}</span>
	{#if pr.labels && pr.labels.length > 0}
		<div class="mt-2 flex flex-wrap gap-1">
			{#each pr.labels as label}
				<span
					class="rounded border px-2 py-0.5 text-xs font-semibold"
					style="background-color: #{label.color}cc; color: {getContrastColor(
						label.color ?? '#3710ff'
					)}; border-color: #{label.color}33;"
				>
					{label.name}
				</span>
			{/each}
		</div>
	{/if}
	<p class="mt-2 text-sm [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400">
		<SvelteMarkdown source={pr.body} />
	</p>
</div>
