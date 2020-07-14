<script>
  import Tailwind from "./Tailwind.svelte";
  import Button from "./components/Button.svelte";
  import { startGameService } from "./machines/gameMachine";
  import Setup from "./views/Setup.svelte";

  let service = startGameService().start();

  service.onTransition(() => {
    service = service;
  });

  const startGame = () => {
    service.send("START_GAME");
  };
  let player = {};

  $: context = service.state.context;

  const joinGame = () => {
    const setPlayer = (p) => {
      player = p;
    };
    const { value } = document.querySelector("#joinGame");
    const { players } = service.send("ADD_PLAYER", { name: value }).context;
    setPlayer(players[players.length - 1]);
  };

  const chooseGenre = () => {
    const { value } = document.querySelector("#producersGenre");
    service.send("CUSTOM_GENRE", { value });
  };
</script>

<main>
  <Tailwind />
  {#if service.state.matches('join')}
    <Setup players={context.players} {player} {joinGame} {startGame} />
  {:else if service.state.matches({ round: 'genre' })}
    <div>
      Genre:
      <span class="capitalize">{context.genre}</span>
      {#if context.genre === "Producer's Choice"}
        <label for="producersGenre">Write your selected</label>
        <input
          id="producersGenre"
          disabled={context.producer !== player.id && false}
          placeholder="Space Westerns, Vampire Movie, Teen Movie, etc." />
        <Button onClick={chooseGenre}>Submit</Button>
      {/if}
    </div>
  {/if}
</main>
