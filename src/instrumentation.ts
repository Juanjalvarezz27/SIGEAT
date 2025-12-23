import { def } from "./scripts/initDb";

//Funcion def que se definio para la data del initDb
export async function register() {
  await def();
}
