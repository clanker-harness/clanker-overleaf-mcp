/**
 * Local model of an open Overleaf document: its full text (lines joined by "\n") and the
 * ShareJS version. Both local edits and remote ops flow through {@link applyOp} so the
 * mirror stays in lock-step with the server.
 */

import * as ot from "./ot.js";

export class Document {
  text = "";
  version = 0;
  /** True once joinDoc has populated text/version from the server. */
  loaded = false;
  /** Realtime connection generation this doc was last joined on (-1 = never). */
  joinGeneration = -1;
  /**
   * Comment ranges from the last joinDoc (encodeRanges). Each entry ties a
   * comment thread to WHERE it sits in this doc: the char position and the
   * quoted text the comment is attached to. Line/column are resolved lazily
   * against the current text.
   */
  commentRanges: Array<{ threadId: string; position: number; quote: string }> = [];

  constructor(
    readonly id: string,
    readonly name: string,
    readonly path: string,
  ) {}

  get lines(): string[] {
    return this.text.split("\n");
  }

  get length(): number {
    return this.text.length;
  }

  /** Populate from a joinDoc response. */
  loadFromLines(lines: string[], version: number): void {
    this.text = lines.join("\n");
    this.version = version;
    this.loaded = true;
  }

  /** Apply a ShareJS op to the local text (does not touch the version). */
  applyOp(op: ot.Op): void {
    this.text = ot.applyOp(this.text, op);
  }

  offsetToRowcol(offset: number): [number, number] {
    return ot.offsetToRowcol(this.text, offset);
  }

  rowcolToOffset(row: number, column: number): number {
    return ot.rowcolToOffset(this.text, row, column);
  }

  lineStartOffset(line: number): number {
    return this.rowcolToOffset(line, 0);
  }
}
