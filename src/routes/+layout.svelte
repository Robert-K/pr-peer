<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();
</script>

<ModeWatcher />

<div class="flex min-h-screen flex-col p-4">
	{@render children?.()}
</div>
