<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { searchRepos, type Repo } from '$lib/github';

	export let selectedRepo: Repo | null = null;
	let query = '';
	let suggestions: Repo[] = [];
	let loading = false;

	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	async function handleCommandInput(val: string) {
		query = val;
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			loading = true;
			try {
				suggestions = await searchRepos(query);
			} catch (e) {
				suggestions = [];
			} finally {
				loading = false;
			}
		}, 200);
	}

	function selectRepo(repo: Repo) {
		selectedRepo = repo;
		query = repo.full_name;
		suggestions = [];
	}
</script>

<div class="w-2xl">
	<Command.Root class="min-w-full rounded-lg border shadow-md" shouldFilter={false}>
		<Command.Input
			placeholder="Search for a repository..."
			bind:value={query}
			oninput={(e) => handleCommandInput((e.target as HTMLInputElement).value)}
			autofocus
		/>
		{#if query !== selectedRepo?.full_name}
			<Command.List>
				{#if !loading && suggestions.length === 0 && query}
					<Command.Empty>No results found.</Command.Empty>
				{:else if suggestions.length > 0}
					<Command.Group heading="Repositories">
						{#each suggestions as repo}
							<Command.Item class="gap-4" onSelect={() => selectRepo(repo)}>
								<div class="font-bold text-nowrap">{repo.full_name}</div>
								{#if repo.description}
									<div class="text-xs text-gray-500">
										{repo.description.length > 80
											? `${repo.description.slice(0, 77)}...`
											: repo.description}
									</div>
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
			</Command.List>
		{/if}
	</Command.Root>
	{#if selectedRepo}
		<div class="mt-4 rounded border bg-gray-50 p-3 dark:bg-gray-900">
			<strong>Selected:</strong>
			{selectedRepo.full_name}
			{#if selectedRepo.description}
				<div class="text-xs text-gray-500">{selectedRepo.description}</div>
			{/if}
		</div>
	{/if}
</div>
