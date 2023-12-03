interface Storable {
  dataURL: () => string;
}

export default class LocalStorage {
  autosaveTimeout?: number;
  key: string;
  value?: Storable;

  constructor(key: string) {
    this.key = key;
  }

  get(): string | null {
    return localStorage.getItem(this.key);
  }

  set(value: Storable) {
    this.value = value;
    this.updateAutosave();
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  updateAutosave() {
    if (this.autosaveTimeout) {
      clearTimeout(this.autosaveTimeout);
    }
    this.autosaveTimeout = setTimeout(() => {
      if (this.value) {
        localStorage.setItem(this.key, this.value.dataURL());
      }
    }, 5000);
  }
}
