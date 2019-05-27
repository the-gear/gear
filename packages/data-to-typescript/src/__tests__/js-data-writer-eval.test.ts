import { JsDataWriter, Exports } from '../js-data-writer';
import { runInNewContext } from 'vm';

const str = 'abc';
const obj = { int: 1, str, nullish: null, undef: undefined };
const arr = [obj, obj, 1, str, null, {}, []];
arr.push(arr);

const rec1 = { rec2: {}, rec3: {} };
const rec2 = { rec1 };
rec1.rec2 = rec2;
rec1.rec3 = rec2;

const child1 = { name: 'child1' };
const child2 = { name: 'child2' };
const collection = {
  children: [child1, child2],
};

const moduleHeader = `
const exports = {};
const module = { exports };
`;

const serialize = (exports: Exports) => new JsDataWriter('CJS').addExports(exports).toString();
const evalModule = (code: string) => runInNewContext(moduleHeader + code + '\nmodule.exports');
const serializeThenEval = (exports: Exports) => evalModule(serialize(exports));

describe('JsDataWriter', () => {
  it('can export primitive values', () => {
    expect(serializeThenEval(obj)).toMatchSnapshot();
  });

  it('can export object', () => {
    expect(serializeThenEval({ obj })).toMatchSnapshot();
  });

  it('can export array', () => {
    expect(serializeThenEval({ arr })).toMatchSnapshot();
  });

  it('can export array', () => {
    expect(serializeThenEval({ obj, arr })).toMatchSnapshot();
  });

  it('can export collection and children', () => {
    expect(serializeThenEval({ collection, child1 })).toMatchSnapshot();
  });

  it('can export recursive object', () => {
    expect(serializeThenEval({ rec1, rec2 })).toMatchSnapshot();
  });

  it('can export recursive object', () => {
    expect(serializeThenEval({ rec1, rec2, recAlias1: rec1, recAlias2: rec2 })).toMatchSnapshot();
  });
});
