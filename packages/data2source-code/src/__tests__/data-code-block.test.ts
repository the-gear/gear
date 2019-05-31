import { DataCodeBlock } from '../data-code-block';
// import { runInNewContext } from 'vm';

// const serialize = (value: unknown) => new JsDataWriter().serialize(value);
// const evalStr = (code: string) => runInNewContext(code);
// const serializeThenEval = (value: unknown) => evalStr('(' + serialize(value) + ')');

// const serialize = (exports: Exports) => new JsDataWriter().addExports(exports).toString();

describe('DataCodeBlock', () => {
  it('can export primitive values', () => {
    const code = new DataCodeBlock();
    code.addExport('int', 1);
    code.addExport('str', 'string');
    code.addExport('str2', 'string');
    code.addExport('nullish', null);
    code.addExport('undef', undefined);
    expect(code.toString()).toMatchInlineSnapshot(`
            "export const str = \\"string\\";
            export const int = 1;
            export const nullish = null;
            export const undef = void 0;
            "
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
    code.addExport('obj', obj);
    expect(code.toString()).toMatchInlineSnapshot(`
            "export const obj = {int:1,str:\\"string\\",nullish:null,undef:void 0};
            "
        `);
  });

  it('can export direct circular object', () => {
    const circObject = { circObject: {} };
    circObject.circObject = circObject;
    const code = new DataCodeBlock();
    code.addExport('circObj', circObject);
    expect(code.toString()).toMatchInlineSnapshot(`
            "export const circObj = {circObject:{/* circular circObj */}};
            circObj.circObject = circObj; /*circ*/
            "
        `);
  });

  it('can export direct circular array', () => {
    const circArray: unknown[] = [];
    circArray.push(circArray);
    const code = new DataCodeBlock();
    code.addExport('circArray', circArray);
    expect(code.toString()).toMatchInlineSnapshot(`
            "export const circArray = [[/* circular circArray */]];
            circArray[0] = circArray; /*circ*/
            "
        `);
  });

  it('can export circular object with references', () => {
    const root: any = { root: true, children: [] };

    root.children.push({ name: 'child1' /*, root*/ });
    root.children.push({ name: 'child2' /*, root*/ });
    root.children.push({ name: 'child3' /*, root*/ });
    root.children.push(root.children[2]);

    const code = new DataCodeBlock();
    code.addExport('child1', root.children[1]);
    code.addExport('root', root);
    code.addExport('child0', root.children[0]);
    expect(code.toString()).toMatchInlineSnapshot(`
      "export const child1 = {name:\\"child2\\"};
      export const child0 = {name:\\"child1\\"};
      const children$1 = {name:\\"child3\\"};
      export const root = {root:true,children:[child0,child1,children$1,children$1]};
      "
    `);
  });
});
