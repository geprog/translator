export function flatten<T extends Record<string, any>>(object: T, path: string | null = null, separator = '.'): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const newPath = [path, key].filter(Boolean).join(separator);
    return typeof object?.[key] === 'object'
      ? { ...acc, ...flatten(object[key], newPath, separator) }
      : { ...acc, [newPath]: object[key] };
  }, {} as T);
}

export function unflatten<T extends Record<string, any>>(data: T): T {
  var result = {} as T;
  for (var i in data) {
    var keys = i.split('.');
    keys.reduce((r, e, j) => {
      return (
        r[e] ||
        ((r as Record<string, unknown>)[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? data[i] : {}) : [])
      );
    }, result as T);
  }
  return result;
}
