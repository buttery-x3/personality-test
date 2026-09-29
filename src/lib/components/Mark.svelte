<script lang="ts">
  let { size = 34 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <path d="M20 2 35.6 11v18L20 38 4.4 29V11Z" stroke="currentColor" stroke-width="1.5" />
  <path d="m4.4 11 31.2 18M35.6 11 4.4 29M20 2v36" stroke="currentColor" stroke-width="1.2" />
  <circle cx="20" cy="20" r="4" fill="currentColor" />
</svg>
