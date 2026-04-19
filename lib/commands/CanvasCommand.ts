import { fabric } from 'fabric'
import type { Command } from './Command'

export type SyncShapeFn = (shape: fabric.Object) => void

// PATTERN: Command — each canvas mutation is captured as a command object.
// This object model supports undo/redo through HistoryManager and keeps
// canvas mutations decoupled from UI events.

export class AddObjectCommand implements Command {
  constructor(
    private canvas: fabric.Canvas,
    private object: fabric.Object,
    private syncShapeInStorage: SyncShapeFn
  ) {}

  execute() {
    this.canvas.add(this.object)
    this.syncShapeInStorage(this.object)
    this.canvas.requestRenderAll()
  }

  undo() {
    this.canvas.remove(this.object)
    if ((this.object as any).objectId) {
      this.syncShapeInStorage(this.object)
    }
    this.canvas.requestRenderAll()
  }
}

export class RemoveObjectCommand implements Command {
  constructor(
    private canvas: fabric.Canvas,
    private object: fabric.Object,
    private deleteShapeFromStorage: (id: string) => void
  ) {}

  execute() {
    this.canvas.remove(this.object)
    if ((this.object as any).objectId) {
      this.deleteShapeFromStorage((this.object as any).objectId)
    }
    this.canvas.discardActiveObject()
    this.canvas.requestRenderAll()
  }

  undo() {
    this.canvas.add(this.object)
    this.canvas.requestRenderAll()
  }
}

export class ModifyObjectCommand implements Command {
  private oldState: Record<string, any>
  private newState: Record<string, any>

  constructor(
    private canvas: fabric.Canvas,
    private object: fabric.Object,
    oldState: Record<string, any>,
    newState: Record<string, any>,
    private syncShapeInStorage: SyncShapeFn
  ) {
    this.oldState = oldState
    this.newState = newState
  }

  execute() {
    this.object.set(this.newState)
    this.syncShapeInStorage(this.object)
    this.canvas.requestRenderAll()
  }

  undo() {
    this.object.set(this.oldState)
    this.syncShapeInStorage(this.object)
    this.canvas.requestRenderAll()
  }
}
