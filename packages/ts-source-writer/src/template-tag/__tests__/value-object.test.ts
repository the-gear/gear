import { runInNewContext } from 'vm';
import { isSource } from '../source';
import { value } from '../value';
import { Source } from 'graphql';

expect.addSnapshotSerializer({
  test: (obj) => isSource(obj),
  print: (obj) => (obj as Source).toString(),
});

const valEval = (x: unknown) => runInNewContext(value(x).toString());

describe('value', () => {
  it('can serialize empty object', () => {
    const emptyObject = {};
    const emptyObjectValue = value(emptyObject);
    expect(emptyObjectValue).toMatchInlineSnapshot(`({})`);
    expect(valEval(emptyObjectValue)).toEqual(emptyObject);
  });

  it('can serialize empty array', () => {
    const emptyArray: unknown[] = [];
    const emptyArrayValue = value(emptyArray);
    expect(emptyArrayValue).toMatchInlineSnapshot(`[]`);
    expect(valEval(emptyArrayValue)).toEqual(emptyArray);
  });

  it('can serialize simple object', () => {
    const simpleObject = {
      int: 1,
      float: 0.125,
      bigint: BigInt('18446744082299486207'),
      undef: undefined,
      null: null,
      obj: {},
      arr: [],
    };
    const simpleObjectValue = value(simpleObject);
    expect(simpleObjectValue).toMatchInlineSnapshot(
      `({int: 1, float: 0.125, bigint: BigInt('18446744082299486207'), undef: undefined, null: null, obj: ({}), arr: []})`,
    );
    expect(valEval(simpleObjectValue)).toEqual(simpleObject);
  });

  it('can serialize nested object', () => {
    const nestedChild = { a: { 'val A': 'A' } };
    const child = { nestedChild, n: nestedChild };
    const child2 = { nestedChild, n: nestedChild };
    const nestedObject = {
      child,
      child2: child2,
      ch1: child,
      arr: [child, child2],
    };
    const nestedObjectValue = value(nestedObject);
    expect(nestedObjectValue).toMatchInlineSnapshot(`
      // #region data definitions
      const nestedChild = ({a: ({"val A": "A"})});

      const child = ({nestedChild, n: nestedChild});

      const child2 = ({nestedChild, n: nestedChild});
      // #endregion data definitions

      ({child, child2, ch1: child, arr: [child, child2]})
    `);
    expect(valEval(nestedObjectValue)).toEqual(nestedObject);
  });
});
