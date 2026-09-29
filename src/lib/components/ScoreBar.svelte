<script lang="ts">
  let {
    label,
    value,
    color,
    small = false,
    prefix = ''
  }: { label: string; value: number; color: string; small?: boolean; prefix?: string } = $props();
</script>

<div class:small class="score-row">
  <div class="score-label">
    <span
      >{#if prefix}<span class="score-prefix">{prefix}</span>{/if}{label}</span
    ><span class="score-value">{Math.round(value)}</span>
  </div>
  <div
    class="score-track"
    role="meter"
    aria-label={label}
    aria-valuenow={Math.round(value)}
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span class="score-fill" style:width={`${value}%`} style:background={color}></span><span
      class="midpoint"
    ></span>
  </div>
</div>
