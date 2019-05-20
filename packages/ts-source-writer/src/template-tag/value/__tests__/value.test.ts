import { runInNewContext } from 'vm';
import { isTsSource } from '../../ts-source';
import { value } from '../value';

expect.addSnapshotSerializer({
  test: (obj) => isTsSource(obj),
  print: (obj) => obj.toString(),
});

const valEval = (x: unknown) => runInNewContext(value(x).toString());

describe('value', () => {
  it('should be idempotent', () => {
    const nullVal = value(':-)');
    expect(value(nullVal)).toEqual(nullVal);
  });

  it('can serialize null', () => {
    const nullVal = value(null);
    expect(nullVal).toMatchInlineSnapshot(`null`);
    expect(valEval(nullVal)).toEqual(null);
  });

  it('can serialize undefined', () => {
    const undefinedVal = value(undefined);
    expect(undefinedVal).toMatchInlineSnapshot(`undefined`);
    expect(valEval(undefinedVal)).toEqual(undefined);
  });

  it('can serialize boolean', () => {
    const trueVal = value(true);
    expect(trueVal).toMatchInlineSnapshot(`true`);
    expect(valEval(trueVal)).toEqual(true);

    const falseVal = value(false);
    expect(falseVal).toMatchInlineSnapshot(`false`);
    expect(valEval(falseVal)).toEqual(false);
  });

  it('can serialize number', () => {
    const intVal = value(37);
    expect(intVal).toMatchInlineSnapshot(`37`);
    expect(valEval(intVal)).toEqual(37);

    const negIntVal = value(-73);
    expect(negIntVal).toMatchInlineSnapshot(`-73`);
    expect(valEval(negIntVal)).toEqual(-73);

    const floatVal = value(0.125);
    expect(floatVal).toMatchInlineSnapshot(`0.125`);
    expect(valEval(floatVal)).toEqual(0.125);

    const valNaN = value(NaN);
    expect(valNaN).toMatchInlineSnapshot(`Number.NaN`);
    expect(valEval(valNaN)).toEqual(NaN);

    const infVal = value(Infinity);
    expect(infVal).toMatchInlineSnapshot(`Number.POSITIVE_INFINITY`);
    expect(valEval(infVal)).toEqual(Infinity);

    const negInfVal = value(-Infinity);
    expect(negInfVal).toMatchInlineSnapshot(`Number.NEGATIVE_INFINITY`);
    expect(valEval(negInfVal)).toEqual(-Infinity);
  });

  it('can serialize string', () => {
    const strVal = value('abc\ndef');
    expect(strVal).toMatchInlineSnapshot(`"abc\\ndef"`);
    expect(valEval(strVal)).toEqual('abc\ndef');
  });

  it('can serialize bigint', () => {
    const bigIntVal = value(BigInt('18446744082299486207'));
    expect(bigIntVal).toMatchInlineSnapshot(`BigInt('18446744082299486207')`);
    expect(valEval(bigIntVal)).toEqual(BigInt('18446744082299486207'));
  });
});
