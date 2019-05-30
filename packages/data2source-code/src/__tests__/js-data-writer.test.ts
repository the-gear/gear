import { JsDataWriter } from '../js-data-writer';
import { runInNewContext } from 'vm';

const serialize = (value: unknown) => JsDataWriter.writeAssignment('data', value);
const serializeThenEval = (value: unknown) => runInNewContext(serialize(value) + '\ndata');

describe('JsDataWriter', () => {
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
      `"const data = {\\"5\\":5,int:1,str:\\"string\\",bigint:BigInt('618970019642690137449562111'),yes:true,no:false,nullish:null,undef:void 0,nan:NaN,inf:Infinity,ninf:-Infinity};"`,
    );
  });

  it('can write array', () => {
    const a2 = [2];
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
      a2,
      a2,
    ];
    expect(serialize(arr)).toMatchInlineSnapshot(`
      "const data = [1,\\"string\\",BigInt('618970019642690137449562111'),true,false,null,void 0,NaN,Infinity,-Infinity,[2],[/* ref data[10] */]];
      data[11] = data[10]; // ref"
    `);
  });

  it('can write sparse array', () => {
    const arr = [0, , , , 5];
    arr[9] = 9;
    expect(serialize(arr)).toMatchInlineSnapshot(`"const data = [0,,,,5,,,,,9];"`);
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

  it('cannot write function', () => {
    function fn() {}
    expect(() => serialize(fn)).toThrowErrorMatchingInlineSnapshot(`"Not implemented: function"`);
  });

  it('cannot write symbol', () => {
    expect(() => serialize(Symbol.for('test'))).toThrowErrorMatchingInlineSnapshot(
      `"Not implemented: symbol"`,
    );
  });

  it('can write circular object', () => {
    const circObject = { circObject: {} };
    circObject.circObject = circObject;
    expect(serialize(circObject)).toMatchInlineSnapshot(`
                  "const data = {circObject:{/* circular data */}};
                  data.circObject = data; // circular"
            `);
  });

  it('can write deep circular object', () => {
    const e = { a: {} };
    const d = { e };
    const c = { d };
    const b = { c, d };
    const a = { b };
    e.a = a;
    expect(serialize(a)).toMatchInlineSnapshot(`
                  "const data = {b:{c:{d:{e:{a:{/* circular data */}}}},d:{/* ref data.b.c.d */}}};
                  data.b.c.d.e.a = data; // circular
                  data.b.d = data.b.c.d; // ref"
            `);
  });

  it('can write circular array', () => {
    const circArray: unknown[] = [];
    circArray.push(circArray);
    circArray.push(circArray);
    expect(serialize(circArray)).toMatchInlineSnapshot(`
                  "const data = [[/* circular data */],[/* circular data */]];
                  data[0] = data; // circular
                  data[1] = data; // circular"
            `);
  });

  it('can be imported', () => {
    expect(JsDataWriter).toBeDefined();
  });

  it('serialize primitives', () => {
    expect(serialize(123)).toMatchInlineSnapshot(`"const data = 123;"`);
    expect(serialize(NaN)).toMatchInlineSnapshot(`"const data = NaN;"`);
    expect(serialize(Infinity)).toMatchInlineSnapshot(`"const data = Infinity;"`);
    expect(serialize(-Infinity)).toMatchInlineSnapshot(`"const data = -Infinity;"`);
    expect(serialize('abc')).toMatchInlineSnapshot(`"const data = \\"abc\\";"`);
    expect(serialize(true)).toMatchInlineSnapshot(`"const data = true;"`);
    expect(serialize(false)).toMatchInlineSnapshot(`"const data = false;"`);
    expect(serialize(null)).toMatchInlineSnapshot(`"const data = null;"`);
    expect(serialize(undefined)).toMatchInlineSnapshot(`"const data = void 0;"`);
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
    expect(serialize({})).toMatchInlineSnapshot(`"const data = {};"`);
  });

  it('can serialize empty array', () => {
    expect(serialize([])).toMatchInlineSnapshot(`"const data = [];"`);
  });

  it('can serialize objects and arrays', () => {
    const obj = { int: 1, str: 'abc', null: null };
    const arr = [1, 'abc', null, {}, [], obj];
    expect(serialize(obj)).toMatchInlineSnapshot(`"const data = {int:1,str:\\"abc\\",null:null};"`);
    expect(serialize(arr)).toMatchInlineSnapshot(
      `"const data = [1,\\"abc\\",null,{},[],{int:1,str:\\"abc\\",null:null}];"`,
    );
    expect(serializeThenEval(obj)).toEqual(obj);
    expect(serializeThenEval(arr)).toEqual(arr);
  });

  it('can serialize undefined', () => {
    expect(serialize(undefined)).toMatchInlineSnapshot(`"const data = void 0;"`);
    expect(serialize([undefined])).toMatchInlineSnapshot(`"const data = [void 0];"`);
    expect(serialize({ undef: undefined })).toMatchInlineSnapshot(`"const data = {undef:void 0};"`);
  });

  it('can serialize BigInt', () => {
    expect(serialize(BigInt('123456789012345678901234567890'))).toMatchInlineSnapshot(
      `"const data = BigInt('123456789012345678901234567890');"`,
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
});
