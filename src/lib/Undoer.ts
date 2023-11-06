export class Undoable<T> {

  stack: Undoable<T>[] = [];

  push(undoable: Undoable<T>) {
    this.stack.push(undoable);
  }

  undo(obj: T) {

  }

  redo(obj: T) {

  }
}

export default class Undoer<O, T extends Undoable<O>> {
  _constructor: new () => T
  undoable?: T
  undoStack: T[] = []
  redoStack: T[] = []
  maxUndo: number

  constructor(constructor: new () => T, maxUndo: number = 20) {
    this._constructor = constructor;
    this.maxUndo = maxUndo
  }

  begin() {
    if (this.undoable) {
      this.undoStack.push(this.undoable);
      if (this.undoStack.length >= this.maxUndo) {
        this.undoStack.splice(0, 1);
      }
    }
    this.undoable = new this._constructor();
  }

  end() {
    if (this.undoable) {
      this.undoStack.push(this.undoable);
      if (this.undoStack.length >= this.maxUndo) {
        this.undoStack.splice(0, 1);
      }
      this.undoable = undefined;
    }
  }

  push(): T {
    const undo = new this._constructor();
    (this.undoable || this.undoStack).push(undo);
    if (this.undoStack.length >= this.maxUndo) {
      this.undoStack.splice(0, 1);
    }
    return undo;
  }

  undo(obj: O) {
    const op = this.undoStack.pop();
    if (!op) return;
    op.undo(obj);
    this.redoStack.push(op);
  }

  redo(obj: O) {
    const op = this.redoStack.pop();
    if (!op) return;
    op.redo(obj);
    this.undoStack.push(op);
    if (this.undoStack.length >= this.maxUndo) {
      this.undoStack.splice(0, 1);
    }
  }
}