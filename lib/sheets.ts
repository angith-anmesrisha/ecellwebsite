import { listAlumni, listEvents, listGraveyard } from "./store";

// Cached reads for public pages, so they render with data already in the HTML.
// Where the data comes from (Sheet or database) is decided in lib/store.ts.
export const getEvents = <T>() => listEvents<T>();
export const getAlumni = <T>() => listAlumni<T>();
export const getGraveyard = <T>() => listGraveyard<T>();
