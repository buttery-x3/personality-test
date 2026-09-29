<script lang="ts">
  let { compact = false }: { compact?: boolean } = $props();
</script>

<div class:compact class="constellation">
  <svg
    viewBox="0 0 540 480"
    role="img"
    aria-label="Six personality perspectives connected around one person"
  >
    <defs
      ><pattern id="constellation-dots" width="22" height="22" patternUnits="userSpaceOnUse"
        ><circle cx="1" cy="1" r=".7" fill="#d9d7cb" /></pattern
      ></defs
    >
    <rect x="20" y="5" width="500" height="460" fill="url(#constellation-dots)" opacity=".7" />
    <g fill="none" stroke="#d4d6c8" stroke-width="1">
      <circle cx="270" cy="230" r="150" stroke-dasharray="3 7" />
      <circle cx="270" cy="230" r="95" />
      <path d="M265 68 413 147 416 305 274 396 123 313 115 145Z" />
      <path d="m265 68 151 237-293 8L265 68M115 145l298 2-139 249L115 145" />
      <path d="m265 68 9 328m-159-251 301 160M123 313l290-166" stroke="#c8ccbc" />
    </g>
    <circle cx="270" cy="230" r="60" fill="#f7f5ee" stroke="#bec7b5" />
    <circle cx="270" cy="230" r="53" fill="#eeeee2" />
    <text x="270" y="242" text-anchor="middle" class="you">you</text>
    <g class="orbit-node"
      ><circle cx="265" cy="68" r="31" fill="#e3ebdf" /><path
        d="M250 71q15-28 30 0m-25 5q10-18 20 0m-10-29v43"
        stroke="#47745c"
        fill="none"
        stroke-width="1.5"
      /><text x="265" y="21" text-anchor="middle">BIG FIVE</text></g
    >
    <g class="orbit-node"
      ><circle cx="413" cy="147" r="28" fill="#eee4cf" /><path
        d="M400 134h26v26h-26zM413 134v26m-13-13h26"
        stroke="#a1804b"
        stroke-width="1.5"
        fill="none"
      /><text x="464" y="136" text-anchor="middle">16-TYPE</text></g
    >
    <g class="orbit-node"
      ><circle cx="416" cy="305" r="30" fill="#efdfd5" /><circle
        cx="416"
        cy="305"
        r="16"
        stroke="#b77963"
        fill="none"
        stroke-width="1.5"
      /><path
        d="m416 289 14 24h-28Zm-15 6 25 10-20 11 5-26 17 17"
        stroke="#b77963"
        stroke-width="1"
        fill="none"
      /><text x="467" y="356" text-anchor="middle">ENNEAGRAM</text></g
    >
    <g class="orbit-node"
      ><circle cx="274" cy="396" r="29" fill="#e1e8ed" /><path
        d="M260 382h11v11h-11zm17 0h11v11h-11zm-17 17h11v11h-11zm17 0h11v11h-11z"
        fill="none"
        stroke="#6c83a1"
        stroke-width="1.5"
      /><text x="274" y="450" text-anchor="middle">DISC</text></g
    >
    <g class="orbit-node"
      ><circle cx="123" cy="313" r="28" fill="#e9e0eb" /><path
        d="m123 295 16 9v18l-16 9-16-9v-18zm0 0v36m-16-27 32 18m0-18-32 18"
        stroke="#887494"
        fill="none"
        stroke-width="1.3"
      /><text x="70" y="360" text-anchor="middle">RIASEC</text></g
    >
    <g class="orbit-node"
      ><circle cx="115" cy="145" r="30" fill="#efe7c9" /><path
        d="m115 127 5 11 12 2-9 9 2 13-10-6-11 6 2-13-9-9 13-2Z"
        stroke="#a6893e"
        fill="none"
        stroke-width="1.4"
      /><text x="63" y="94" text-anchor="middle">HOGWARTS</text></g
    >
    <g fill="#8c9c84"
      ><circle cx="177" cy="215" r="3" /><circle cx="343" cy="173" r="3" /><circle
        cx="310"
        cy="313"
        r="3"
      /></g
    >
    <path
      d="M366 54v12m-6-6h12M71 241v10m-5-5h10M369 397v10m-5-5h10"
      stroke="#b69b66"
      stroke-width="1.3"
    />
  </svg>
  {#if !compact}<span class="diagram-caption">SAME ANSWERS. DIFFERENT LENSES.</span>{/if}
</div>
