// import { DataCollection } from '../data-collection';

// describe('DataCollection', () => {
//   it('can be imported and instantiated', () => {
//     expect(DataCollection).toBeDefined();
//     const collection = new DataCollection();
//     expect(collection).toBeDefined();
//   });

//   it('can write primitives', () => {
//     const collection = new DataCollection();
//     collection.add(1, 'numVal');
//     collection.add('string', 'strVal');
//     collection.add(null, 'nullVal');
//     collection.add(undefined, 'undefinedVal');
//     collection.add(true, 'trueVal');
//     collection.add(false, 'falseVal');
//     collection.add(BigInt('123456789012345678901234567890'), 'bigInt');
//     expect(collection.getTsCode().split('\n')).toEqual([
//       'const numVal = 1;',
//       'const strVal = "string";',
//       'const nullVal = null;',
//       'const undefinedVal = undefined;',
//       'const trueVal = true;',
//       'const falseVal = false;',
//       'const bigInt = BigInt("123456789012345678901234567890");',
//     ]);
//   });

//   it('should serialize other types as undefined with comment', () => {
//     const collection = new DataCollection();
//     collection.add(() => {}, 'fnVal');
//     collection.add(Symbol('custom'), 'symbolVal');
//     expect(collection.getTsCode().split('\n')).toEqual([
//       'const fnVal = undefined /* () => { } */;',
//       'const symbolVal = undefined /* Symbol(custom) */;',
//     ]);
//   });

//   it('can write object with various keys', () => {
//     const data = {
//       37: 73,
//       number: 1,
//       string: 'string',
//       null: null,
//       true: true,
//       false: false,
//       undefined: undefined,
//     };
//     const collection = new DataCollection();
//     collection.add(data, 'data');
//     expect(collection.getTsCode()).toEqual(
//       `const data = {"37": 73, number: 1, string: "string", null: null, true: true, false: false, undefined: undefined};`,
//     );
//   });

//   it('can write array', () => {
//     const arr = [1, 'string', null, undefined, true, false];
//     const collection = new DataCollection();
//     collection.add(arr, 'arr');
//     expect(collection.getTsCode()).toEqual(
//       `const arr = [1, "string", null, undefined, true, false];`,
//     );
//   });
// });
