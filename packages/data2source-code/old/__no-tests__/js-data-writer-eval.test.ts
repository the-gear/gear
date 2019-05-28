import { JsDataWriter, Exports } from '../js-data-writer';
import { runInNewContext } from 'vm';

const str = 'abc';
const obj = { int: 1, str, nullish: null, undef: undefined };
const arr = [obj, obj, 1, str, null, {}, []];
const recArr: any[] = [obj];
recArr.push(recArr);

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
    expect(serializeThenEval(obj)).toEqual(obj);
  });

  it('can export object', () => {
    const exports = { obj };
    expect(serializeThenEval(exports)).toEqual(exports);
  });

  it('can export array', () => {
    const exports = { arr };
    expect(serializeThenEval(exports)).toEqual(exports);
  });

  it('can export object and array', () => {
    const exports = { obj, arr };
    expect(serializeThenEval(exports)).toEqual(exports);
  });

  it('can export collection and children', () => {
    const exports = { collection, child1 };
    expect(serializeThenEval(exports)).toEqual(exports);
  });

  it('can export recursive object', () => {
    const exports = { rec1, rec2 };
    expect(serializeThenEval(exports)).toEqual(exports);
  });

  it('can export recursive array', () => {
    const exports = { recArr };
    expect(serializeThenEval(exports)).toEqual(exports);
  });
});
