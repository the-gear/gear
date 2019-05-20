import { runInNewContext } from 'vm';
import { isTsSource } from '../../ts-source';
import { value } from '../value';

expect.addSnapshotSerializer({
  test: (obj) => isTsSource(obj),
  print: (obj) => obj.toString(),
});

const valEval = (x: unknown) => runInNewContext(value(x).toString());

describe('value', () => {
  // it('can serialize empty object', () => {
  //   const emptyObject = {};
  //   const emptyObjectValue = value(emptyObject);
  //   expect(emptyObjectValue).toMatchInlineSnapshot(`/* c:1 [] *//* c:1 [] */`);
  //   expect(valEval(emptyObjectValue)).toEqual(emptyObject);
  // });

  it('can serialize nested object', () => {
    const child = {};
    const nestedObject = {
      child,
      child2: child,
    };
    const nestedObjectValue = value(nestedObject);
    expect(nestedObjectValue).toMatchInlineSnapshot(
      `/* c:1 [] *//* c:2 [child: 1, child2: 1] *//* c:1 [] */`,
    );
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
    expect(simpleObjectValue).toMatchInlineSnapshot(`/* c:1 [] *//* c:1 [] */`);
    expect(valEval(simpleObjectValue)).toEqual(simpleObject);
  });
});
