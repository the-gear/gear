import { JsDataWriter, Exports } from '../js-data-writer';
// import { runInNewContext } from 'vm';

// const serialize = (value: unknown) => new JsDataWriter().serialize(value);
// const evalStr = (code: string) => runInNewContext(code);
// const serializeThenEval = (value: unknown) => evalStr('(' + serialize(value) + ')');

const str = 'abc';
const obj = { int: 1, str, nullish: null, undef: undefined };
const arr = [obj, obj, 1, str, null, {}, []];

const rec1 = { rec2: {}, rec3: {} };
const rec2 = { rec1 };
rec1.rec2 = rec2;
rec1.rec3 = rec2;

const child1 = { name: 'child1' };
const child2 = { name: 'child2' };
const collection = {
  children: [child1, child2],
};

const serialize = (exports: Exports) => new JsDataWriter().addExports(exports).toString();

describe('JsDataWriter', () => {
  it('can export primitive values', () => {
    expect(serialize(obj)).toMatchInlineSnapshot(`
      "export const int = 1;
      export const str = \\"abc\\";
      export const nullish = null;
      export const undef = undefined;"
    `);
  });

  it('can export object', () => {
    expect(serialize({ obj })).toMatchInlineSnapshot(
      `"export const obj = {int:1,str:\\"abc\\",nullish:null,undef:undefined};"`,
    );
  });

  it('can export array', () => {
    expect(serialize({ arr })).toMatchInlineSnapshot(`
      "const arr$0 = {int:1,str:\\"abc\\",nullish:null,undef:undefined};
      export const arr = [arr$0,arr$0,1,\\"abc\\",null,{},[]];"
    `);
  });

  it('can export array', () => {
    expect(serialize({ obj, arr })).toMatchInlineSnapshot(`
      "export const obj = {int:1,str:\\"abc\\",nullish:null,undef:undefined};
      export const arr = [obj,obj,1,\\"abc\\",null,{},[]];"
    `);
  });

  it('can export collection and children', () => {
    expect(serialize({ collection, child1 })).toMatchInlineSnapshot(`
      "export const child1 = {name:\\"child1\\"};
      export const collection = {children:[child1,{name:\\"child2\\"}]};"
    `);
  });

  it('can export recursive object', () => {
    expect(serialize({ rec1, rec2 })).toMatchInlineSnapshot(`
      "export const rec2 = {rec1:{rec2:{ /* rec2 */ },rec3:{ /* rec2 */ }}};
      rec2.rec1.rec2 = rec2;
      rec2.rec1.rec3 = rec2;
      export const rec1 = {rec2:rec2,rec3:rec2};"
    `);
  });

  it('can export recursive object', () => {
    expect(serialize({ rec1, rec2, recAlias1: rec1, recAlias2: rec2 })).toMatchInlineSnapshot(`
      "export const rec2 = {rec1:{rec2:{ /* rec2 */ },rec3:{ /* rec2 */ }}};
      rec2.rec1.rec2 = rec2;
      rec2.rec1.rec3 = rec2;
      export const recAlias2 = rec2;
      export const rec1 = {rec2:rec2,rec3:rec2};
      export const recAlias1 = rec1;"
    `);
  });
});
