/**
 * @fileoverview 函数式工具库单元测试
 * @description 测试 curry, cond, compose, pipe, memoize 等函数式工具
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  curry,
  curryN,
  cond,
  condAny,
  compose,
  pipe,
  memoize,
  partial,
  assert,
  always,
  identity,
  head,
  tail,
  last,
  take,
  drop,
  groupBy,
  prop,
  merge,
  isNil,
  isArray,
  isObject,
  path,
  tap,
} from '@/lib/fn'

describe('函数式工具库', () => {
  describe('curry - 柯里化', () => {
    it('应将二元函数转换为柯里化形式', () => {
      const add = curry((a: number, b: number) => a + b)
      expect(add(1)(2)).toBe(3)
    })

    it('应支持部分应用', () => {
      const add = curry((a: number, b: number) => a + b)
      const add5 = add(5)
      expect(add5(3)).toBe(8)
    })

    it('应正确处理元数大于参数数量的情况', () => {
      const add = curry((a: number, b: number) => a + b)
      expect(add(1, 2)).toBe(3)
    })
  })

  describe('curryN - 指定参数数量的柯里化', () => {
    it('应按指定参数数量进行柯里化', () => {
      const add3 = curryN(3, (a: number, b: number, c: number) => a + b + c)
      expect(add3(1)(2)(3)).toBe(6)
      expect(add3(1, 2)(3)).toBe(6)
      expect(add3(1, 2, 3)).toBe(6)
    })
  })

  describe('cond - 条件匹配', () => {
    it('应匹配第一个满足条件的函数', () => {
      const classify = cond([
        [(n: number) => n < 0, 'negative'],
        [(n: number) => n === 0, 'zero'],
        [(n: number) => n > 0, 'positive'],
      ] as [((n: number) => boolean), string][])

      expect(classify(-5)).toBe('negative')
      expect(classify(0)).toBe('zero')
      expect(classify(5)).toBe('positive')
    })

    it('应支持布尔值作为条件', () => {
      const test = cond([
        [false, 'no'],
        [true, 'yes'],
      ] as [boolean, string][])

      expect(test(0)).toBe('yes')
    })

    it('应支持函数返回值', () => {
      const process = cond([
        [(n: number) => n < 0, (n: number) => n * 2],
        [(n: number) => n >= 0, (n: number) => n * 3],
      ] as [((n: number) => boolean), ((n: number) => number)][])

      expect(process(-5)).toBe(-10)
      expect(process(5)).toBe(15)
    })

    it('若无匹配应返回原值', () => {
      const test = cond([
        [(n: number) => n > 100, 'big'],
      ] as [((n: number) => boolean), string][])

      expect(test(50)).toBe(50)
    })
  })

  describe('condAny - 通用条件匹配', () => {
    it('应支持返回不同类型', () => {
      const convert = condAny([
        [(n: number) => n < 0, 'negative'],
        [(n: number) => n === 0, 0],
        [(n: number) => n > 0, true],
      ] as [((n: number) => boolean), unknown][])

      expect(convert(-5)).toBe('negative')
      expect(convert(0)).toBe(0)
      expect(convert(5)).toBe(true)
    })
  })

  describe('compose - 函数组合（从右到左）', () => {
    it('应从右到左组合函数', () => {
      const double = (n: number) => n * 2
      const add5 = (n: number) => n + 5
      const square = (n: number) => n * n

      const f = compose(double, add5, square)
      // f(x) = double(add5(square(x))) = double(add5(x^2)) = double(x^2 + 5) = 2 * (x^2 + 5) = 2x^2 + 10
      expect(f(3)).toBe(28) // 2 * (9 + 5) = 28
    })

    it('应支持单函数', () => {
      const double = (n: number) => n * 2
      const f = compose(double)
      expect(f(5)).toBe(10)
    })

    it('空函数组合应返回第一个参数', () => {
      const f = compose()
      expect(f(5)).toBe(5)
    })
  })

  describe('pipe - 管道函数（从左到右）', () => {
    it('应从左到右执行函数', () => {
      const double = (n: number) => n * 2
      const add5 = (n: number) => n + 5
      const square = (n: number) => n * n

      const f = pipe(double, add5, square)
      // f(x) = square(add5(double(x))) = square(double(x) + 5) = (2x + 5)^2
      expect(f(3)).toBe(121) // (6 + 5)^2 = 121
    })
  })

  describe('memoize - 记忆化', () => {
    it('应缓存相同参数的结果', () => {
      let callCount = 0
      const fn = memoize((n: number) => {
        callCount++
        return n * 2
      })

      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(callCount).toBe(1)
    })

    it('不同参数应重新计算', () => {
      let callCount = 0
      const fn = memoize((n: number) => {
        callCount++
        return n * 2
      })

      fn(5)
      fn(6)
      expect(callCount).toBe(2)
    })

    it('应支持多参数', () => {
      let callCount = 0
      const add = memoize((a: number, b: number) => {
        callCount++
        return a + b
      })

      expect(add(1, 2)).toBe(3)
      expect(add(1, 2)).toBe(3)
      expect(add(1, 2)).toBe(3)
      expect(callCount).toBe(1)
    })
  })

  describe('partial - 偏函数应用', () => {
    it('应固定部分参数', () => {
      const add = (a: number, b: number, c: number) => a + b + c
      const add5 = partial(add, 5)

      expect(add5(3, 2)).toBe(10)
    })
  })

  describe('assert - 断言', () => {
    it('满足条件时应正常返回', () => {
      const isPositive = assert((n: number) => n > 0, 'must be positive')
      expect(() => isPositive(5)).not.toThrow()
    })

    it('不满足条件时应抛出错误', () => {
      const isPositive = assert((n: number) => n > 0, 'must be positive')
      expect(() => isPositive(-5)).toThrow('must be positive')
    })
  })

  describe('always - 常量函数', () => {
    it('应始终返回指定值', () => {
      const five = always(5)
      expect(five()).toBe(5)
      expect(five()).toBe(5)
    })
  })

  describe('identity - 身份函数', () => {
    it('应返回输入值', () => {
      expect(identity(5)).toBe(5)
      expect(identity('hello')).toBe('hello')
      expect(identity({ a: 1 })).toEqual({ a: 1 })
    })
  })

  describe('head - 返回第一个元素', () => {
    it('应返回数组第一个元素', () => {
      expect(head([1, 2, 3])).toBe(1)
      expect(head(['a', 'b'])).toBe('a')
    })

    it('空数组应返回 undefined', () => {
      expect(head([])).toBeUndefined()
    })
  })

  describe('tail - 返回除第一个元素外的所有元素', () => {
    it('应返回除第一个元素外的数组', () => {
      expect(tail([1, 2, 3])).toEqual([2, 3])
      expect(tail(['a', 'b', 'c'])).toEqual(['b', 'c'])
    })

    it('单元素数组应返回空数组', () => {
      expect(tail([1])).toEqual([])
    })

    it('空数组应返回空数组', () => {
      expect(tail([])).toEqual([])
    })
  })

  describe('last - 返回最后一个元素', () => {
    it('应返回数组最后一个元素', () => {
      expect(last([1, 2, 3])).toBe(3)
      expect(last(['a', 'b'])).toBe('b')
    })

    it('空数组应返回 undefined', () => {
      expect(last([])).toBeUndefined()
    })
  })

  describe('take - 取前n个元素', () => {
    it('应返回前n个元素', () => {
      expect(take(3, [1, 2, 3, 4, 5])).toEqual([1, 2, 3])
      expect(take(10, [1, 2])).toEqual([1, 2])
    })

    it('n为0应返回空数组', () => {
      expect(take(0, [1, 2, 3])).toEqual([])
    })

    it('n为负数应返回除最后一个外的元素', () => {
      // slice(0, -1) returns all elements except the last
      expect(take(-1, [1, 2, 3])).toEqual([1, 2])
    })
  })

  describe('drop - 排除前n个元素', () => {
    it('应返回排除前n个元素后的数组', () => {
      expect(drop(2, [1, 2, 3, 4, 5])).toEqual([3, 4, 5])
    })

    it('n大于数组长度应返回空数组', () => {
      expect(drop(10, [1, 2])).toEqual([])
    })

    it('n为0应返回原数组', () => {
      expect(drop(0, [1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('groupBy - 数组分组', () => {
    it('应按函数结果分组', () => {
      const result = groupBy((n: number) => n % 2 === 0 ? 'even' : 'odd')([1, 2, 3, 4, 5])
      expect(result).toEqual({
        odd: [1, 3, 5],
        even: [2, 4],
      })
    })

    it('应按对象属性分组', () => {
      const items = [{ type: 'a', val: 1 }, { type: 'b', val: 2 }, { type: 'a', val: 3 }]
      const result = groupBy((item: { type: string }) => item.type)(items)
      expect(result).toEqual({
        a: [{ type: 'a', val: 1 }, { type: 'a', val: 3 }],
        b: [{ type: 'b', val: 2 }],
      })
    })
  })

  describe('prop - 属性读取', () => {
    it('应返回对象的指定属性', () => {
      const getName = prop<string>('name')
      expect(getName({ name: 'Alice', age: 30 })).toBe('Alice')
    })

    it('属性不存在应返回 undefined', () => {
      const getName = prop<string>('name')
      expect(getName({ age: 30 })).toBeUndefined()
    })

    it('应支持数字索引', () => {
      const getFirst = prop<string>(0)
      expect(getFirst(['a', 'b', 'c'])).toBe('a')
    })
  })

  describe('merge - 合并对象', () => {
    it('应合并对象', () => {
      const addAge = merge({ age: 30 })
      const person = addAge({ name: 'Alice' })
      expect(person).toEqual({ name: 'Alice', age: 30 })
    })

    it('后者应覆盖前者', () => {
      const override = merge({ name: 'Bob' })
      const result = override({ name: 'Alice', age: 30 })
      expect(result).toEqual({ name: 'Bob', age: 30 })
    })
  })

  describe('isNil - 判断 null 或 undefined', () => {
    it('应正确判断 null', () => {
      expect(isNil(null)).toBe(true)
    })

    it('应正确判断 undefined', () => {
      expect(isNil(undefined)).toBe(true)
    })

    it('应正确判断其他值', () => {
      expect(isNil(0)).toBe(false)
      expect(isNil('')).toBe(false)
      expect(isNil(false)).toBe(false)
      expect(isNil({})).toBe(false)
    })
  })

  describe('isArray - 判断数组', () => {
    it('应正确判断数组', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('应正确判断非数组', () => {
      expect(isArray('hello')).toBe(false)
      expect(isArray({})).toBe(false)
      expect(isArray(123)).toBe(false)
    })
  })

  describe('isObject - 判断对象', () => {
    it('应正确判断对象', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })

    it('应正确判断非对象', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject([])).toBe(false)
      expect(isObject('hello')).toBe(false)
      expect(isObject(123)).toBe(false)
    })
  })

  describe('path - 嵌套属性读取', () => {
    it('应读取嵌套属性', () => {
      const obj = { a: { b: { c: 42 } } }
      expect(path<number>(['a', 'b', 'c'], obj)).toBe(42)
    })

    it('中间路径为 undefined 应返回 undefined', () => {
      const obj = { a: { b: null } }
      expect(path<number>(['a', 'b', 'c'], obj)).toBeUndefined()
    })

    it('空路径应返回原对象', () => {
      const obj = { a: 1 }
      expect(path<object>([], obj)).toEqual({ a: 1 })
    })
  })

  describe('tap - 副作用注入', () => {
    it('应在不改变值的情况下执行副作用', () => {
      let sideEffect = 0
      const process = tap((n: number) => { sideEffect = n * 2 })

      expect(process(5)).toBe(5)
      expect(sideEffect).toBe(10)
    })
  })
})
