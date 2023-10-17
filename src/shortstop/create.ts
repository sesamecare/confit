import { ShortstopHandler } from '../types';
import { isObject } from '../common';

interface InternalHandler {
  protocol: string;
  regex: RegExp;
  predicate: (value: string) => boolean;
  stack: ShortstopHandler[];
}

class ShortstopHandlers {
  private handlers: Record<string, InternalHandler> = {};

  constructor(private parent?: ShortstopHandlers) {}

  getHandler(value: string): InternalHandler | undefined {
    let handler: InternalHandler | undefined;
    if (
      Object.keys(this.handlers).some((protocol) => {
        const current = this.handlers[protocol];

        // Test the value to see if this is the appropriate handler.
        if (current?.predicate(value)) {
          handler = current;
          return true;
        }

        return false;
      })
    ) {
      return handler;
    }

    return this.parent?.getHandler(value);
  }

  getStack(protocol: string): ShortstopHandler[] | undefined {
    const currentStack = this.handlers?.[protocol]?.stack;
    const parentStack = this.parent?.getStack(protocol);
    const hasParent = parentStack && parentStack.length > 0;

    if (currentStack && hasParent) {
      return currentStack.concat(parentStack);
    }

    if (hasParent) {
      return parentStack;
    }

    return currentStack;
  }

  /**
   * Register a given handler for the provided protocol.
   */
  use<Input, Output>(protocol: string, implementation: ShortstopHandler<Input, Output>) {
    let handler = this.handlers[protocol];

    if (!handler) {
      const regex = new RegExp(`^${protocol}:`);
      handler = {
        protocol,
        regex,
        predicate(value) {
          return regex.test(value);
        },
        stack: [],
      };
      this.handlers[protocol] = handler;
    }

    handler.stack.push(implementation as ShortstopHandler);

    let removed = false;
    return function unuse() {
      let idx;
      if (!removed) {
        removed = true;
        idx = handler.stack.indexOf(implementation as ShortstopHandler);
        return handler.stack.splice(idx, 1)[0];
      }
      return undefined;
    };
  }

  async resolve(
    data: unknown | unknown[] | Record<string, unknown>,
    filename?: string,
  ): Promise<unknown> {
    if (
      Array.isArray(data) ||
      (isObject(data) && Object.getPrototypeOf(data) === Object.prototype)
    ) {
      if (Array.isArray(data)) {
        return Promise.all(data.map((value) => this.resolve(value, filename)));
      }
      const tasks: Record<string, unknown> = {};
      const dataObj = data as Record<string, unknown>;
      await Promise.all(
        Object.keys(dataObj).map(async (key) => {
          const resolved = await this.resolve(dataObj[key], filename);
          tasks[key] = resolved;
        }),
      );
      return tasks;
    }

    if (typeof data === 'string') {
      const handler = this.getHandler(data);
      if (!handler) {
        return data;
      }

      const stack = this.getStack(handler.protocol);
      if (!stack) {
        return data;
      }

      // Remove protocol prefix
      const value = data.slice(handler.protocol.length + 1);
      return stack.reduce(
        (acc, fn) => acc.then((v) => fn(v, filename)),
        Promise.resolve(value as unknown),
      );
    }

    return data;
  }
}

export function createShortstopHandlers(parent?: ShortstopHandlers): ShortstopHandlers {
  return new ShortstopHandlers(parent);
}
