import { SimpleDataWriter } from '../simple-data-writer';

const serialize = (value: unknown) => SimpleDataWriter.stringify(value);
// const evalStr = (code: string) => runInNewContext(code);
// const serializeThenEval = (value: unknown) => evalStr('(' + serialize(value) + ')');

// const serialize = (exports: Exports) => new JsDataWriter().addExports(exports).toString();

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
    const arr = [0, , , , 5, , , , , , , , , ,];
    arr[9] = 9;
    expect(serialize(arr)).toMatchInlineSnapshot(`"[0,,,,5,,,,,9,,,,]"`);
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
});
