// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  // We inferred 3 attributes!
  // Take a look at this schema, and if everything looks good,
  // run `push schema` again to enforce the types.
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    bots: i.entity({
      avatar: i.string().optional(),
      email: i.string().optional(),
      name: i.string().optional(),
    }),
    profiles: i.entity({
      avatar: i.string().optional(),
      email: i.string().optional(),
      name: i.string().optional(),
    }),
    xogame: i.entity({
      board: i.json(),
      track: i.json(),
      currentTurn: i.string(),
      moveCount: i.number(),
      key: i.string().unique().indexed(),
      playerOUserId: i.string(),
      playerXUserId: i.string(),
      status: i.string().optional(),
      type: i.string().indexed(),
      updatedAt: i.number().indexed().optional(),
      wonBy: i.string().optional(),
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
    xogame: {
      presence: i.entity({
        id: i.string(),
        name: i.string().optional(),
        email: i.string().optional(),
        avatar: i.string().optional(),
      }),
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
