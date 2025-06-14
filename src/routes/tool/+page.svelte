<script>
	import DarkModeToggle from '$lib/components/dark-mode-toggle.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
</script>

<div class="flex flex-row justify-between">
	<div class="h-12 w-24 flex-shrink-0">
		<img src="/pr-peer.png" alt="Logo" class="-ml-2" />
	</div>
	<DarkModeToggle />
</div>

<Separator class="my-4" />

This is where the tool goes.
