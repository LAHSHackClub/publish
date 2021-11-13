
import { Page, PaginationResult } from "../schemas/mod.ts";

// Flattens a database query into a friendly object
export function flatten(res: PaginationResult<Page>) {
  return res.results.map((page) => flattenPage(page));
}

// Flattens an individual page's properties
function flattenPage(page: Page) {
  // Transpose properties to new object
  const flat = { ...page.properties, id: page.id };
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