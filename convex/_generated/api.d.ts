/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accountSettings from "../accountSettings.js";
import type * as goals from "../goals.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as milestones from "../milestones.js";
import type * as notes from "../notes.js";
import type * as performanceQuestions from "../performanceQuestions.js";
import type * as performanceResponses from "../performanceResponses.js";
import type * as resend from "../resend.js";
import type * as retros from "../retros.js";
import type * as tasks from "../tasks.js";
import type * as timeline from "../timeline.js";
import type * as workHours from "../workHours.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accountSettings: typeof accountSettings;
  goals: typeof goals;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  milestones: typeof milestones;
  notes: typeof notes;
  performanceQuestions: typeof performanceQuestions;
  performanceResponses: typeof performanceResponses;
  resend: typeof resend;
  retros: typeof retros;
  tasks: typeof tasks;
  timeline: typeof timeline;
  workHours: typeof workHours;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
