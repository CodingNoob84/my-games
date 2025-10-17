import { i, init } from "@instantdb/react-native";

const APP_ID = process.env.EXPO_PUBLIC_INSTANT_DB_APP_ID!;

export const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    bots: i.entity({
      email: i.string(),
      avatar: i.string(),
      name: i.string(),
    }),
    profiles: i.entity({
      email: i.string(),
      name: i.string(),
      avatar: i.string(),
    }),
    xogame: i.entity({
      board: i.string().optional(),
      currentTurn: i.string().optional(),
      key: i.string().unique().indexed().optional(),
      playerOUserId: i.string(),
      playerXUserId: i.string(),
      status: i.string().optional(),
      type: i.string().indexed().optional(),
      wonBy: i.string().optional(), // userId of the player who won
      updatedAt: i.number().indexed().optional(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    profilesUser: {
      forward: {
        on: "profiles",
        has: "one",
        label: "user",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "profile",
      },
    },
  },
  rooms: {
    xo: {
      presence: i.entity({
        id: i.string(),
        status: i.string(),
      }),
      topics: {
        move: i.entity({
          index: i.number(),
          symbol: i.string(),
        }),
        state: i.entity({
          board: i.string(),
          currentTurn: i.string(),
          status: i.string(),
        }),
      },
    },
  },
});

export const db = init({ appId: APP_ID, schema });
