import { runInNewContext } from 'vm';
import { isSource } from '../../source';
import { value } from '../value';

expect.addSnapshotSerializer({
  test: (obj) => isSource(obj),
  print: (obj) => obj.toString(),
});

const valEval = (x: unknown) => runInNewContext(value(x).toString());

describe('value', () => {
  it('can serialize empty object', () => {
    const emptyObject = {};
    const emptyObjectValue = value(emptyObject);
    expect(emptyObjectValue).toMatchInlineSnapshot(`/* 0× [] */`);
    expect(valEval(emptyObjectValue)).toEqual(emptyObject);
  });

  it('can serialize nested object', () => {
    const nestedChild = {};
    const child = { nestedChild };
    const nestedObject = {
      child,
      child2: child,
      child3: child,
    };
    const nestedObjectValue = value(nestedObject);
    expect(nestedObjectValue).toMatchInlineSnapshot(`
      /* #region hoisted definitions */

      // 1× [child: 1, child2: 1, child3: 1]
      const child = null; // TODO
      // 1× [nestedChild: 3, child$nestedChild: 1, child2$nestedChild: 1, child3$nestedChild: 1]
      const nestedChild = null; // TODO
      /* #endregion hoisted definitions */
      /* 0× [] */
    `);
    expect(valEval(nestedObjectValue)).toEqual(nestedObject);
  });

  it('can serialize simple object', () => {
    const simpleObject = {
      int: 1,
      float: 0.125,
      bigint: BigInt('18446744082299486207'),
      undef: undefined,
      null: null,
    };
    const simpleObjectValue = value(simpleObject);
    expect(simpleObjectValue).toMatchInlineSnapshot(`/* 0× [] */`);
    expect(valEval(simpleObjectValue)).toEqual(simpleObject);
  });
});
