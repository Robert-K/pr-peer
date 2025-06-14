<script lang="ts">
	import type { SearchIssue } from '$lib/github';
	import Button from './ui/button/button.svelte';

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
	<p class="mt-2 text-sm">{pr.body}</p>
</div>
