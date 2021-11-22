
import {
  Flattenable,
  Flattened,
  PaginationResult
} from "../schemas/mod.ts";

// Flattens a database query into a friendly object
export function flattenResult(res: PaginationResult): Flattened[] {
  return res.results.map((page) => flatten(page));
}

// Flattens database meta information
export function flattenDb(db: Flattenable): Flattened {
  // Transpose properties to new object
  const flat: Flattened = {
    properties: db.properties,
    id: db.id,
    created_time: db.created_time,
    last_edited_time: db.last_edited_time
  };
  // Flatten each individual property recursively
  for (const key of Object.keys(db.properties))
    flat.properties[key] = flattenProperty(db.properties[key]);
  // Set properties to their type directly
  for (const key of Object.keys(flat.properties))
    flat.properties[key] = flat.properties[key].type;
  // Return flattened object
  return flat;
}

// Flattens an individual object's properties
export function flatten(page: Flattenable): Flattened {
  // Transpose properties to new object
  const flat: Flattened = {
    ...page.properties,
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time
  };
  // Flatten each individual property recursively
  for (const key of Object.keys(page.properties))
    flat[key] = flattenProperty(page.properties[key]);
  // Return flattened object
  return flat;
}

// Recursively flattens a property
function flattenProperty(property: any, type?: string): any {
  // Skip if falsy - cannot be flattened
  if (!property) return property;

  if (property.constructor === Array) {
    let flat = property.map(p => {
      return { ...flattenProperty(p, p.type ?? type), name: p.name }});
    (flat as any).type = type ?? "any";
    return flat;
  }
  else if (property.type && typeof property[property.type] === "object")
    return flattenProperty(property[property.type], property.type);
  else return { ...property, type: type ?? "any" };
}