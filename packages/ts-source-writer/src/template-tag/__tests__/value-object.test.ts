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
    const emptyArray = [];
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
    };
    const simpleObjectValue = value(simpleObject);
    expect(simpleObjectValue).toMatchInlineSnapshot(
      `({int: 1, float: 0.125, bigint: BigInt('18446744082299486207'), undef: undefined, null: null})`,
    );
    expect(valEval(simpleObjectValue)).toEqual(simpleObject);
  });

  it('can serialize nested object', () => {
    const nestedChild = { a: 1 };
    const child = { nestedChild, n: nestedChild };
    const nestedObject = {
      child,
      child2: child,
      child3: child,
    };
    const nestedObjectValue = value(nestedObject);
    expect(nestedObjectValue).toMatchInlineSnapshot(`
      // #region data definitions
      const nestedChild = ({a: 1});

      const child = ({nestedChild, n: nestedChild});
      // #endregion data definitions

      ({child, child2: child, child3: child})
    `);
    expect(valEval(nestedObjectValue)).toEqual(nestedObject);
  });
});
