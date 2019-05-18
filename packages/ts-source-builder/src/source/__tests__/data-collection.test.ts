import { DataCollection } from '../data-collection';

describe('DataCollection', () => {
  it('can be imported and instantiated', () => {
    expect(DataCollection).toBeDefined();
    const collection = new DataCollection();
    expect(collection).toBeDefined();
  });

  it('can write primitives', () => {
    const collection = new DataCollection();
    collection.add(1, 'numVal');
    collection.add('string', 'strVal');
    collection.add(null, 'nullVal');
    collection.add(undefined, 'undefinedVal');
    collection.add(true, 'trueVal');
    collection.add(false, 'falseVal');
    collection.add(BigInt('123456789012345678901234567890'), 'bigInt');
    expect(collection.getTsCode().split('\n')).toEqual([
      'export const numVal = 1;',
      'export const strVal = "string";',
      'export const nullVal = null;',
      'export const undefinedVal = undefined;',
      'export const trueVal = true;',
      'export const falseVal = false;',
      'export const bigInt = BigInt("123456789012345678901234567890");',
    ]);
  });

  it('should serialize other types as undefined with comment', () => {
    const collection = new DataCollection();
    collection.add(() => {}, 'fnVal');
    collection.add(Symbol('custom'), 'symbolVal');
    expect(collection.getTsCode().split('\n')).toEqual([
      'export const fnVal = undefined /* () => { } */;',
      'export const symbolVal = undefined /* Symbol(custom) */;',
    ]);
  });

  it('can write object with various keys', () => {
    const data = {
      number: 1,
      string: 'string',
      null: null,
      undefined: undefined,
      true: true,
      false: false,
      74: 47,
    };
    const collection = new DataCollection();
    collection.add(data, 'data');
    expect(collection.getTsCode()).toEqual(
      `export const data = {"74": 47, number: 1, string: "string", null: null, undefined: undefined, true: true, false: false};`,
    );
  });

  it('can write array', () => {
    const arr = [1, 'string', null, undefined, true, false];
    const collection = new DataCollection();
    collection.add(arr, 'arr');
    expect(collection.getTsCode()).toEqual(
      `export const arr = [1, "string", null, undefined, true, false];`,
    );
  });

  describe('should preserve referential integrity', () => {
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
  });
});
