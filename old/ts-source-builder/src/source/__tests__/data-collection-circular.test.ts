import { DataCollection } from '../data-collection';

const a = { thisIs: 'A' };
const b = { 'and this is': 'B', with: [1, 2, 3] };
const arr = ['the A:', a, 'and the B', b];
const obj1 = { arr, arr2: arr, arr3: [...arr] };
const recurrentArray: any[] = ['recursive', []];
recurrentArray[1] = recurrentArray;
const obj2 = {
  a: {
    int123: 123,
    obj1,
    nested: { a, b, ref1: obj1, obj2: {} },
  },
  recurrentArray,
  obj2: {},
};
obj2.obj2 = obj2;
obj2.a.nested.obj2 = obj2.a;

describe('DataCollection should handle circular structures', () => {
  it('recursive', () => {
    const o1 = { id: 1, o1: {}, o3: {} };
    const o2 = { id: 2, o1 };
    const o3 = { id: 3, o2 };
    o1.o1 = o1;
    o1.o3 = o3;

    const collection = new DataCollection();
    const arr = [o1, o2, o3];
    collection.add(arr, 'arr1');
    collection.add(arr, 'arr2');
    collection.add([...arr], 'arr3');
    expect(collection).toMatchInlineSnapshot(`
      const $ = {id: 2, o1: {id: 1, o1: { /* recursive $.o1 */ }, o3: {id: 3, o2: { /* recursive $ */ }}}};
      $.o1.o1 = $.o1;
      $.o1.o3.o2 = $;
      const $$1 = { /* recursive $.o1.o3 */ };
      $$1 = $.o1.o3;
      const $$2 = { /* recursive $.o1 */ };
      $$2 = $.o1;
      const arr1 = [$.o1, $, $.o1.o3];
      const arr2 = arr1;
      const arr3 = [$.o1, $, $.o1.o3];
    `);
  });

  it('nested', () => {
    const o1 = { id: 1 };
    const o2 = { id: 2, o1 };

    const collection = new DataCollection();
    const arr = [o1, o2, o1, o2];
    collection.add(arr, 'arr');
    expect(collection).toMatchInlineSnapshot(`
      const $ = {id: 1};
      const $$1 = {id: 2, o1: $};
      const arr = [$, $$1, $, $$1];
    `);
  });

  it('nested complex', () => {
    const collection = new DataCollection();
    collection.add(obj2, 'obj2');
    expect(collection).toMatchInlineSnapshot(`
      const $$1 = "the A:";
      const $$2 = {thisIs: "A"};
      const $$4 = "and the B";
      const $$5 = {"and this is": "B", with: [1, 2, 3]};
      const $$6 = ["the A:", $$2, "and the B", $$5];
      const $$7 = {arr: $$6, arr2: $$6, arr3: ["the A:", $$2, "and the B", $$5]};
      const $$8 = {int123: 123, obj1: $$7, nested: {a: $$2, b: $$5, ref1: $$7, obj2: { /* recursive $$8 */ }}};
      $$8.nested.obj2 = $$8;
      const $$9 = ["recursive", [ /* recursive $$9 */ ]];
      $$9[1] = $$9;
      const obj2 = {a: $$8, recurrentArray: $$9, obj2: { /* recursive obj2 */ }};
      obj2.obj2 = obj2;
      const $$b = "the A:";
      const $$d = "and the B";
    `);
  });
});
