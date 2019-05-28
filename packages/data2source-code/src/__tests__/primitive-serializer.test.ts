import { PrimitiveSerializer } from '../data-converter';
// import { runInNewContext } from 'vm';

const serialize = (value: unknown) => new PrimitiveSerializer().convert(value);
// const evalStr = (code: string) => runInNewContext(code);
// const serializeThenEval = (value: unknown) => evalStr('(' + serialize(value) + ')');

// const serialize = (exports: Exports) => new JsDataWriter().addExports(exports).toString();

describe('PrimitiveSerializer', () => {
  it('can convert primitive values', () => {
    const obj = {
      int: 1,
      str: 'string',
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
      `"{int:1,str:\\"string\\",bigint:BigInt('618970019642690137449562111'),yes:true,no:false,nullish:null,undef:void 0,nan:NaN,inf:Infinity,ninf:-Infinity}"`,
    );
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
