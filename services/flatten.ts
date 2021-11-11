
import { Page, PaginationResult } from "../schemas/mod.ts";

export function flatten(res: PaginationResult<Page>) {
  return res.results.map((page) => flattenPage(page));
}

function flattenPage(page: Page) {
  const flat = {
    ...page.properties,
    id: page.id
  }
  for (const key of Object.keys(page.properties)) {
    const property = flat[key];
    flat[key] = flattenProperty(property);
  }
  return flat;
}

function flattenProperty(property: any, type?: string): any {
  if (property.constructor === Array) {
    const flat = flattenProperty(property[0], type);
    if (property[0].name) flat.name = property[0].name;
    return { ...flat, type: type ?? "any" }
  }
  else if (property.type)
    return flattenProperty(property[property.type], property.type);
  else return { ...property, type: type ?? "any" };
}