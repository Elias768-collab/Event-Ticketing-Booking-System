
import { randomUUID, randomBytes } from "node:crypto";

// Generate a unique internal ID.
export function newId() {
  return randomUUID();
}

// Generate a short, readable booking reference.
export function newReference() {
  return randomBytes(4).toString("hex").toUpperCase();
}
