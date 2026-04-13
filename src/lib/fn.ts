/**
 * @fileoverview 函数式工具库
 * @description 实现常用的函数式编程工具函数：柯里化、cond组合、compose、pipe等
 */

/**
 * 柯里化函数
 * 将多参数函数转换为一系列单参数函数
 */
export function curry(fn: Function): Function {
  return function curried(this: any, ...args: any[]) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function (this: any, ...next: any[]) {
      return curried.apply(this, [...args, ...next])
    }
  }
}

/**
 * 柯里化函数（支持固定参数数量）
 */
export function curryN(n: number, fn: Function): Function {
  return function curried(this: any, ...args: any[]) {
    if (args.length >= n) {
      return fn.apply(this, args)
    }
    return function (this: any, ...next: any[]) {
      return curried.apply(this, [...args, ...next])
    }
  }
}

/**
 * cond 条件匹配函数
 * 类似R.compose(R.filter(R.whereEq({test: R.eq(n)})))(cases)
 * 使用方式: cond([ [pred, fn], [pred, fn], [T, defaultFn] ])
 */
export function cond<T>(cases: [boolean | ((arg: T) => boolean), T | ((arg: T) => T), ...any[]][]): (arg: T) => T {
  return (arg: T) => {
    for (const [pred, fn, ...rest] of cases) {
      const result = typeof pred === 'function' ? (pred as (arg: T) => boolean)(arg) : pred
      if (result) {
        return typeof fn === 'function' ? (fn as (arg: T) => T)(arg) : fn
      }
    }
    return arg as T
  }
}

/**
 * 更通用的cond变体，返回任意类型
 */
export function condAny<T, R>(cases: [boolean | ((arg: T) => boolean), R | ((arg: T) => R), ...any[]][]): (arg: T) => R {
  return (arg: T) => {
    for (const [pred, fn, ...rest] of cases) {
      const result = typeof pred === 'function' ? (pred as (arg: T) => boolean)(arg) : pred
      if (result) {
        return typeof fn === 'function' ? (fn as (arg: T) => R)(arg) : fn
      }
    }
    return arg as unknown as R
  }
}

/**
 * 函数组合（从右到左）
 * compose(f, g, h)(x) = f(g(h(x)))
 */
export function compose(...fns: Function[]): Function {
  return function composed(this: any, ...args: any[]) {
    return fns.reduceRight((acc, fn) => [fn.apply(this, acc)], args)[0]
  }
}

/**
 * 管道函数（从左到右）
 * pipe(f, g, h)(x) = h(g(f(x)))
 */
export function pipe(...fns: Function[]): Function {
  return function piped(this: any, ...args: any[]) {
    return fns.reduce((acc, fn) => [fn.apply(this, acc)], args)[0]
  }
}

/**
 * 记忆化函数
 * 缓存相同输入的结果
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>()
  return function memoized(this: any, ...args: any[]): any {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as T
}

/**
 * 偏函数应用
 * 固定函数的部分参数
 */
export function partial(fn: Function, ...presetArgs: any[]): Function {
  return function partiallyApplied(this: any, ...laterArgs: any[]) {
    return fn.apply(this, [...presetArgs, ...laterArgs])
  }
}

/**
 * 断言函数 - 确保值为真
 */
export function assert(predicate: (arg: any) => boolean, message: string = 'Assertion failed'): (arg: any) => asserts arg {
  return function assertFn(arg: any): asserts arg {
    if (!predicate(arg)) {
      throw new Error(`${message}: ${JSON.stringify(arg)}`)
    }
  }
}

/**
 * 始终返回指定值的常量函数
 */
export function always<T>(value: T): () => T {
  return () => value
}

/**
 * 身份函数
 */
export function identity<T>(arg: T): T {
  return arg
}

/**
 * 返回第一个参数
 */
export function head<T>(arr: T[]): T | undefined {
  return arr[0]
}

/**
 * 返回除第一个元素外的所有元素
 */
export function tail<T>(arr: T[]): T[] {
  return arr.slice(1)
}

/**
 * 返回最后一个元素
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

/**
 * 取数组前n个元素
 */
export function take<T>(n: number, arr: T[]): T[] {
  return arr.slice(0, n)
}

/**
 * 排除数组前n个元素
 */
export function drop<T>(n: number, arr: T[]): T[] {
  return arr.slice(n)
}

/**
 * 数组分组
 */
export function groupBy<T>(fn: (item: T) => string | number): (arr: T[]) => Record<string, T[]> {
  return (arr: T[]) => {
    return arr.reduce((groups, item) => {
      const key = String(fn(item))
      groups[key] = groups[key] || []
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }
}

/**
 * 从对象取值
 */
export function prop<T>(key: string | number): (obj: Record<string | number, T>) => T | undefined {
  return (obj) => obj[key]
}

/**
 * 合并对象
 */
export function merge<T extends object>(obj: Partial<T>): (target: T) => T {
  return (target) => ({ ...target, ...obj })
}

/**
 * 判断是否未定义或为空
 */
export function isNil(val: any): val is null | undefined {
  return val === null || val === undefined
}

/**
 * 判断是否为数组
 */
export function isArray(val: any): val is any[] {
  return Array.isArray(val)
}

/**
 * 判断是否为对象
 */
export function isObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * 安全的对象属性读取
 */
export function path<T>(keys: (string | number)[], obj: any): T | undefined {
  return keys.reduce((acc, key) => (acc ? acc[key] : undefined), obj)
}

/**
 * 函数链式调用
 */
export function tap<T>(fn: (arg: T) => any): (arg: T) => T {
  return (arg) => {
    fn(arg)
    return arg
  }
}
