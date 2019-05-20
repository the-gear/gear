import { runInNewContext } from 'vm';
import { isTsSource } from '../../ts-source';
import { value } from '../value';

expect.addSnapshotSerializer({
  test: (obj) => isTsSource(obj),
  print: (obj) => obj.toString(),
});

const valEval = (x: unknown) => runInNewContext(value(x).toString());

describe('value', () => {
  it('can serialize empty object', () => {
    const emptyObjectValue = value({});
    expect(emptyObjectValue).toMatchInlineSnapshot(`({})`);
    expect(valEval(emptyObjectValue)).toEqual({});
  });
});
