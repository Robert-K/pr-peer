<script lang="ts">
	import { goto } from '$app/navigation';
	import DarkModeToggle from '$lib/components/dark-mode-toggle.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="flex flex-row justify-between">
	<div></div>
	<DarkModeToggle />
</div>

<div class="flex flex-grow flex-col items-center justify-center">
	<div>
		<img src="/pr-peer.png" alt="Logo" class="-my-12 h-96" />
	</div>
	<p class="mb-16 text-2xl font-light">Code review at a glance</p>
	<Button size="lg" class="px-8 py-6 text-xl" onclick={() => goto('/tool')}>Get started</Button>
</div>
