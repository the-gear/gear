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
  it('can serialize recursive object', () => {
    const recursiveObj = {
      obj: {},
    };
    recursiveObj.obj = recursiveObj;
    const recursiveObjValue = value(recursiveObj);
    expect(recursiveObjValue).toMatchInlineSnapshot(`({obj: {} /* recursive ? */})`);
    // expect(valEval(recursiveObjValue)).toEqual(recursiveObj);
  });
});
