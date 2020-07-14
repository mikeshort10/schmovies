<script>
  export let onClick,
    color = "";
</script>

<button class={`px-3 py-2 shadow rounded ${color}`} on:click={onClick}>
  <slot />
</button>
