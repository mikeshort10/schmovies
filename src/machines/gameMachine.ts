import { Machine, assign, DoneInvokeEvent, interpret, send } from "xstate";

type Genre = typeof genres[number] | "";

type Player = {
  name: string;
  id: number;
  schquids: number;
};

type Context = {
  players: Player[];
  genre: Genre;
  what: string;
  who: string;
  producer: number;
};

const genres = [
  // "RomCom",
  // "Horror",
  // "Action",
  // "Drama",
  // "SciFi",
  "Producer's Choice",
] as const;

const returnFromArray = (...arr: string[]) => async () => {
  console.log(`selecting from ${JSON.stringify(arr)}`);
  return new Promise<string>((resolve) =>
    resolve(arr[Math.floor(Math.random() * arr.length)])
  );
};

const randomAdjective = returnFromArray(
  "happy",
  "sad",
  "weird",
  "ugly",
  "smelly"
);

const randomNoun = returnFromArray(
  "food",
  "man",
  "woman",
  "cheeseburger",
  "oregano"
);

const invokeRandomWord = ({
  id,
  src,
  target,
  contextKey,
}: {
  id: string;
  src: () => Promise<string>;
  target: string;
  contextKey: string;
}) => ({
  id,
  src,
  onDone: {
    target,
    actions: assign<Context, DoneInvokeEvent<any>>({
      [contextKey]: (_: any, { data }: DoneInvokeEvent<any>) => data,
    }),
  },
});

const gameMachine = Machine<Context>({
  id: "gameMachine",
  initial: "join",
  context: {
    players: [],
    genre: "",
    what: "",
    who: "",
    producer: 0,
  },
  states: {
    join: {
      on: {
        ADD_PLAYER: {
          target: "join",
          actions: assign({
            players: ({ players }, { name }) => [
              ...players,
              {
                name,
                schquids: 0,
                id: players.length,
              },
            ],
          }),
        },
        START_GAME: {
          target: "round",
          actions: () => console.log("starting game!"),
        },
      },
    },
    round: {
      initial: "evaluate",
      states: {
        evaluate: {
          always: [
            {
              target: "#gameMachine.win",
              cond: ({ players }) =>
                players.find(({ schquids }) => schquids >= 4) != null,
            },
            { target: "genre" },
          ],
        },

        genre: {
          entry: [
            assign<Context>({
              genre: (): Genre => {
                console.log("selecting genre");
                return genres[Math.floor(Math.random() * genres.length)];
              },
            }),
            send("NEXT"),
          ],
          on: {
            CUSTOM_GENRE: {
              actions: [
                assign({
                  genre: ({ genre }, { value }) => value || genre,
                }),
                send("NEXT"),
              ],
            },
            NEXT: {
              target: "what",
              actions: (_, e) => console.log(e),
              cond: ({ genre }) => {
                console.log(genre);
                return genre !== "Producer's Choice";
              },
            },
          },
        },
        what: invokeRandomWord({
          id: "getAdjective",
          src: randomAdjective,
          target: "who",
          contextKey: "what",
        }),
        who: invokeRandomWord({
          id: "getNoun",
          src: randomNoun,
          target: "submit",
          contextKey: "who",
        }),
        submit: {
          on: { NEXT: "reveal" },
        },
        reveal: {
          on: { NEXT: "judge" },
        },
        judge: {
          on: {
            NEXT: {
              target: "evaluate",
              actions: assign<Context, { type: string; winnerId?: number }>({
                players: ({ players }, { winnerId }) =>
                  players.map((player) =>
                    player.id === winnerId
                      ? { ...player, schquids: player.schquids + 1 }
                      : player
                  ),
                producer: ({ producer }, { winnerId }) => winnerId || producer,
              }),
            },
          },
        },
      },
      exit: () => assign({ who: "", what: "", genre: "" }),
    },
    win: {},
  },
});

export const startGameService = () => interpret(gameMachine);
