import { isFunction } from './utils';

type Handler = (...args: any[]) => void;
type Condition<T> = T | ((reference: T) => boolean);

export class ConditionalHandlerCaller<T> {
  private readonly reference: T;
  private readonly actions: Array<{
    condition: Condition<T>;
    handler: Handler;
  }> = [];

  constructor(reference: T) {
    this.reference = reference;
  }

  public add(condition: Condition<T>, handler: Handler): ConditionalHandlerCaller<T> {
    this.actions.push({ condition, handler });
    return this;
  }

  /**
   * @param defaultHandler
   * @returns {Boolean} isDone - если был вызван хоть один обработчик
   */
  public check(defaultHandler?: Handler): boolean {
    let isFound: boolean = false;
    this.actions.forEach(({ condition, handler }) => {
      if (isFunction(condition) ? condition(this.reference) : condition === this.reference) {
        handler();
        isFound = true;
      }
    });

    if (!isFound && defaultHandler) {
      defaultHandler();
    }
    return isFound || !!defaultHandler;
  }
}
