import { DataCodeBlock } from '../data-code-block';
// import { runInNewContext } from 'vm';

// const serialize = (value: unknown) => new JsDataWriter().serialize(value);
// const evalStr = (code: string) => runInNewContext(code);
// const serializeThenEval = (value: unknown) => evalStr('(' + serialize(value) + ')');

// const serialize = (exports: Exports) => new JsDataWriter().addExports(exports).toString();

describe('DataCodeBlock', () => {
  it('can export primitive values', () => {
    const code = new DataCodeBlock();
    code.addConst('int', 1);
    code.addConst('str', 'string');
    // code.addConst('str2', 'string');
    code.addConst('nullish', null);
    code.addConst('undef', undefined);
    expect(code.toString()).toMatchInlineSnapshot(`
            "const int = 1; // 1
            const str = \\"string\\"; // 1
            const nullish = null; // 1
            const undef = void 0; // 1"
        `);
  });

  it('can export primitive values', () => {
    const obj = {
      int: 1,
      str: 'string',
      nullish: null,
      undef: undefined,
    };
    const code = new DataCodeBlock();
    code.addConst('obj', obj);
    expect(code.toString()).toMatchInlineSnapshot(
      `"const obj = {int:1,str:\\"string\\",nullish:null,undef:void 0}; // 1"`,
    );
  });

  it('can export direct circular object', () => {
    const circObject = { circObject: {} };
    circObject.circObject = circObject;
    const code = new DataCodeBlock();
    code.addConst('circObj', circObject);
  });

  it('can export direct circular array', () => {
    const circArray: unknown[] = [];
    circArray.push(circArray);
    const code = new DataCodeBlock();
    code.addConst('circArray', circArray);
  });
});
