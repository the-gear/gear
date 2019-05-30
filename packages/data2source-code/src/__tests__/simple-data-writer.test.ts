import { SimpleDataWriter } from '../simple-data-writer';
import { runInNewContext } from 'vm';

const serialize = (value: unknown) => SimpleDataWriter.stringify(value);
const serializeThenEval = (value: unknown) => runInNewContext('(' + serialize(value) + ')');

describe('SimpleDataWriter', () => {
  it('can write object with primitive values', () => {
    const obj = {
      int: 1,
      str: 'string',
      5: 5,
      bigint: BigInt('618970019642690137449562111'),
      yes: true,
      no: false,
      nullish: null,
      undef: undefined,
      nan: NaN,
      inf: Infinity,
      ninf: -Infinity,
    };
    expect(serialize(obj)).toMatchInlineSnapshot(
      `"{\\"5\\":5,int:1,str:\\"string\\",bigint:BigInt('618970019642690137449562111'),yes:true,no:false,nullish:null,undef:void 0,nan:NaN,inf:Infinity,ninf:-Infinity}"`,
    );
  });

  it('can write array', () => {
    const arr = [
      1,
      'string',
      BigInt('618970019642690137449562111'),
      true,
      false,
      null,
      undefined,
      NaN,
      Infinity,
      -Infinity,
    ];
    expect(serialize(arr)).toMatchInlineSnapshot(
      `"[1,\\"string\\",BigInt('618970019642690137449562111'),true,false,null,void 0,NaN,Infinity,-Infinity]"`,
    );
  });

  it('can write sparse array', () => {
    const arr = [0, , , , 5];
    arr[9] = 9;
    expect(serialize(arr)).toMatchInlineSnapshot(`"[0,,,,5,,,,,9]"`);
    // Known bug
    // const arr2 = [, ,];
    // expect(serialize(arr2)).toMatchInlineSnapshot(`"[,,]"`);
  });
  it('can eval sparse array', () => {
    const arr = [0, , , , 5];
    arr[9] = 9;
    expect(serializeThenEval(arr)).toEqual(arr);
    // Known bug
    // const arr2 = [];
    // arr2.length = 3;
    // expect(serializeThenEval(arr2)).toEqual(arr2);
  });

  it('cannot convert function', () => {
    function fn() {}
    expect(() => serialize(fn)).toThrowErrorMatchingInlineSnapshot(`"Not implemented: function"`);
  });

  it('cannot convert symbol', () => {
    expect(() => serialize(Symbol.for('test'))).toThrowErrorMatchingInlineSnapshot(
      `"Not implemented: symbol"`,
    );
  });

  it('cannot convert circular object', () => {
    const circObject = { circObject: {} };
    circObject.circObject = circObject;
    expect(() => serialize(circObject)).toThrowErrorMatchingInlineSnapshot(
      `"Circular value detected"`,
    );
  });

  it('cannot convert circular array', () => {
    const circArray: unknown[] = [];
    circArray.push(circArray);
    expect(() => serialize(circArray)).toThrowErrorMatchingInlineSnapshot(
      `"Circular value detected"`,
    );
  });

  it('can be imported', () => {
    expect(SimpleDataWriter).toBeDefined();
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
    expect(serialize(undefined)).toMatchInlineSnapshot(`"void 0"`);
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
    expect(serialize(obj)).toMatchInlineSnapshot(`"{int:1,str:\\"abc\\",null:null}"`);
    expect(serialize(arr)).toMatchInlineSnapshot(
      `"[1,\\"abc\\",null,{},[],{int:1,str:\\"abc\\",null:null}]"`,
    );
    expect(serializeThenEval(obj)).toEqual(obj);
    expect(serializeThenEval(arr)).toEqual(arr);
  });

  it('can serialize undefined', () => {
    expect(serialize(undefined)).toMatchInlineSnapshot(`"void 0"`);
    expect(serialize([undefined])).toMatchInlineSnapshot(`"[void 0]"`);
    expect(serialize({ undef: undefined })).toMatchInlineSnapshot(`"{undef:void 0}"`);
  });

  it('can serialize BigInt', () => {
    expect(serialize(BigInt('123456789012345678901234567890'))).toMatchInlineSnapshot(
      `"BigInt('123456789012345678901234567890')"`,
    );
  });

  it('throws on function', () => {
    expect(() => serialize(() => {})).toThrowErrorMatchingInlineSnapshot(
      `"Not implemented: function"`,
    );
  });

  it('throws on symbol', () => {
    expect(() => serialize(Symbol())).toThrowErrorMatchingInlineSnapshot(
      `"Not implemented: symbol"`,
    );
  });

  it('throws on recursion', () => {
    const a = { ref: {} };
    a.ref = a;
    expect(() => serialize(a)).toThrowErrorMatchingInlineSnapshot(`"Circular value detected"`);

    const b = { a: { b: { c: a } } };
    expect(() => serialize(b)).toThrowErrorMatchingInlineSnapshot(`"Circular value detected"`);

    const arr1 = [a];
    expect(() => serialize(arr1)).toThrowErrorMatchingInlineSnapshot(`"Circular value detected"`);

    const arr2 = [, b, a];
    expect(() => serialize(arr2)).toThrowErrorMatchingInlineSnapshot(`"Circular value detected"`);
  });
});
