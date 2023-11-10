interface Revivifiable {
  name: string
  from(v: any): any
}

const revivifiers: { [key: string]: Revivifiable } = {};

export function Revivifiable<T extends Revivifiable>(r: T): T {
  revivifiers[r.name] = r;
  return r;
}

export function revivify(_key: string, value: any) {
  if (value instanceof Object && value.class !== undefined) {
    const revivifier = revivifiers[value.class]
    if (revivifier) {
      return revivifier.from(value.data);
    }
  }
  return value;
}