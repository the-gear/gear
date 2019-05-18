import { DataCollection } from '../data-collection';

const a = { thisIs: 'A' };
const b = { 'and this is': 'B', with: [1, 2, 3] };
const arr = ['the A:', a, 'and the B', b];
const obj1 = { arr, arr2: arr, arr3: [...arr] };
const obj2 = {
  a: {
    int123: 123,
    obj1,
    nested: { a, b, ref1: obj1 },
  },
};

describe('DataCollection should preserve referential integrity', () => {
  it('in order', () => {
    const o1 = {};
    const o2 = {};
    const arr = [1, o1, 2, o2];
    const collection = new DataCollection();
    collection.add(o1, 'o1');
    collection.add(o2, 'o2');
    collection.add(arr, 'arr');
    expect(collection.getTsCode().split('\n')).toEqual([
      'export const o1 = {};',
      'export const o2 = {};',
      'export const arr = [1, o1, 2, o2];',
    ]);
  });

  it('order reversed', () => {
    const o1 = {};
    const o2 = {};
    const arr = [1, o1, 2, o2];
    const collection = new DataCollection();
    collection.add(arr, 'arr');
    collection.add(o1, 'o1');
    collection.add(o2, 'o2');
    expect(collection.getTsCode()).toMatchInlineSnapshot(`
                                  "export const o1 = {};
                                  export const o2 = {};
                                  export const arr = [1, o1, 2, o2];"
                        `);
  });

  it('without hint', () => {
    const o1 = {};
    const o2 = {};
    const arr = [o1, o2, o2, o1];
    const collection = new DataCollection();
    collection.add(arr, 'arr');
    expect(collection.getTsCode()).toMatchInlineSnapshot(`
                          "const $$1 = {};
                          const $$2 = {};
                          export const arr = [$$1, $$2, $$2, $$1];"
                  `);
  });

  it('recursive', () => {
    const o1 = { id: 1, o1: undefined, o3: undefined };
    const o2 = { id: 2, o1 };
    const o3 = { id: 3, o2 };
    o1.o1 = o1;
    o1.o3 = o3;

    const collection = new DataCollection();
    const arr = [o1, o2, o3];
    collection.add(arr, 'arr1');
    collection.add(arr, 'arr2');
    collection.add([...arr], 'arr3');
    expect(collection.getTsCode()).toMatchInlineSnapshot(`
                          "const $$1 = {id: 1, o1: undefined /* recursive $$1 */, o3: {id: 3, o2: {id: 2, o1: undefined /* recursive $$1 */}}};
                          $$1.o1 = $$1
                          $$1.o3.o2.o1 = $$1
                          export const arr1 = [$$1, $$1.o3.o2, $$1.o3];
                          export const arr2 = arr1;
                          export const arr3 = [$$1, $$1.o3.o2, $$1.o3];"
                  `);
  });

  it('nested', () => {
    const o1 = { id: 1 };
    const o2 = { id: 2, o1 };

    const collection = new DataCollection();
    const arr = [o1, o2, o1, o2];
    collection.add(arr, 'arr');
    expect(collection.getTsCode()).toMatchInlineSnapshot(`
                  "const $$1 = {id: 1};
                  const $$2 = {id: 2, o1: $$1};
                  export const arr = [$$1, $$2, $$1, $$2];"
            `);
  });

  it('nested complex', () => {
    const collection = new DataCollection();
    collection.add(obj2, 'obj2');
    expect(collection.getTsCode().split(/\s*,\s*/g)).toMatchInlineSnapshot(`
      Array [
        "export const obj2 = {a: {int123: 123",
        "obj1: {arr: [\\"the A:\\"",
        "{thisIs: \\"A\\"}",
        "\\"and the B\\"",
        "{\\"and this is\\": \\"B\\"",
        "with: [1",
        "2",
        "3]}]",
        "arr2: obj2.a.obj1.arr",
        "arr3: [\\"the A:\\"",
        "obj2.a.obj1.arr[1]",
        "\\"and the B\\"",
        "obj2.a.obj1.arr[3]]}",
        "nested: {a: obj2.a.obj1.arr[1]",
        "b: obj2.a.obj1.arr[3]",
        "ref1: obj2.a.obj1}}};",
      ]
    `);
  });
});
