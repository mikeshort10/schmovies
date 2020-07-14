<script>
  import Button from "../components/Button.svelte";
  export let players, player, joinGame, startGame;
</script>

<div>
  <h1 class="text-center text-4xl">Welcome to Schmovie!</h1>
  <div class="h-20">
    {#each players as { name, schquids }}
      <span class="pl-4">{name}: {schquids}</span>
    {/each}
  </div>

  <div class="flex justify-center mt-12">
    {#if player.name == null}
      <label for="joinGame">Player Name</label>
      <div class="pl-3">
        <input id="joinGame" class="shadow rounded text-center" value="Mike" />
      </div>
    {:else}
      <p>{player.name}: {player.schquids} Schquids</p>
    {/if}
  </div>

  <div class="flex justify-around mt-5 w-64 mx-auto">
    <Button onClick={joinGame}>Join Game</Button>
    <Button onClick={startGame}>Start Game</Button>
  </div>
</div>
