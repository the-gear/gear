import { ReferentialSerializer } from '../referential-serializer';
import { runInNewContext } from 'vm';

const serialize = (value: unknown) => new ReferentialSerializer().serialize(value);
const serializeThenEval = (value: unknown) => runInNewContext('(' + serialize(value) + ')');

describe('ReferentialSerializer (simple)', () => {
  it('can be imported', () => {
    expect(ReferentialSerializer).toBeDefined();
  });

  it('serialize primitives', () => {
    expect(serialize(123)).toMatchInlineSnapshot(`"123"`);
    expect(serialize(NaN)).toMatchInlineSnapshot(`"NaN"`);
    expect(serialize(Infinity)).toMatchInlineSnapshot(`"Infinity"`);
    expect(serialize(-Infinity)).toMatchInlineSnapshot(`"-Infinity"`);
    expect(serialize('abc')).toMatchInlineSnapshot(`"\\"abc\\""`);
    expect(serialize(true)).toMatchInlineSnapshot(`"true"`);
    expect(serialize(false)).toMatchInlineSnapshot(`"false"`);
    expect(serialize(null)).toMatchInlineSnapshot(`"null"`);
    expect(serialize(undefined)).toMatchInlineSnapshot(`"undefined"`);
  });

  it('serialize primitives as evaluable', () => {
    expect(serializeThenEval(123)).toStrictEqual(123);
    expect(serializeThenEval(NaN)).toBeNaN();
    expect(serializeThenEval(Infinity)).toStrictEqual(Infinity);
    expect(serializeThenEval(-Infinity)).toStrictEqual(-Infinity);
    expect(serializeThenEval('abc')).toStrictEqual('abc');
    expect(serializeThenEval(true)).toStrictEqual(true);
    expect(serializeThenEval(false)).toStrictEqual(false);
    expect(serializeThenEval(null)).toBeNull();
    expect(serializeThenEval(undefined)).toBeUndefined();
  });

  it('can serialize empty object', () => {
    expect(serialize({})).toMatchInlineSnapshot(`"{}"`);
  });

  it('can serialize empty array', () => {
    expect(serialize([])).toMatchInlineSnapshot(`"[]"`);
  });

  it('can serialize objects and arrays', () => {
    const obj = { int: 1, str: 'abc', null: null };
    const arr = [1, 'abc', null, {}, [], obj];
    expect(serializeThenEval(obj)).toEqual(obj);
    expect(serializeThenEval(arr)).toEqual(arr);
  });

  it('can serialize undefined', () => {
    expect(serialize(undefined)).toMatchInlineSnapshot(`"undefined"`);
    expect(serialize([undefined])).toMatchInlineSnapshot(`"[undefined]"`);
    expect(serialize({ undef: undefined })).toMatchInlineSnapshot(`"{undef:undefined}"`);
  });

  it('can serialize BigInt', () => {
    expect(serialize(BigInt('123456789012345678901234567890'))).toMatchInlineSnapshot(
      `"BigInt('123456789012345678901234567890')"`,
    );
  });

  it('throws on function', () => {
    expect(() => serialize(() => {})).toThrowErrorMatchingInlineSnapshot(
      `"ReferentialSerializer.serializeFunction: unknown value"`,
    );
  });

  it('throws on symbol', () => {
    expect(() => serialize(Symbol())).toThrowErrorMatchingInlineSnapshot(
      `"ReferentialSerializer.serializeSymbol: unknown value"`,
    );
  });

  it('throws on recursion', () => {
    const a = { ref: {} };
    a.ref = a;
    expect(() => serialize(a)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $.ref = $"`,
    );

    const b = { a: { b: { c: a } } };
    expect(() => serialize(b)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $.a.b.c.ref = $.a.b.c"`,
    );

    const arr1 = [a];
    expect(() => serialize(arr1)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $[0].ref = $[0]"`,
    );

    const arr2 = [, b, a];
    expect(() => serialize(arr2)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $[1].a.b.c.ref = $[1].a.b.c"`,
    );
  });
});
