// import { DataCollection } from '../data-collection';

// describe('DataCollection should preserve referential integrity', () => {
//   it('in order', () => {
//     const o1 = {};
//     const o2 = {};
//     const arr = [1, o1, 2, o2];
//     const collection = new DataCollection();
//     collection.add(o1, 'o1');
//     collection.add(o2, 'o2');
//     collection.add(arr, 'arr');
//     expect(collection).toMatchInlineSnapshot(`
//       const o1 = {};
//       const o2 = {};
//       const arr = [1, o1, 2, o2];
//     `);
//   });

//   it('order reversed', () => {
//     const o1 = {};
//     const o2 = {};
//     const arr = [1, o1, 2, o2];
//     const collection = new DataCollection();
//     collection.add(arr, 'arr');
//     collection.add(o1, 'o1');
//     collection.add(o2, 'o2');
//     expect(collection).toMatchInlineSnapshot(`
//       const o1 = {};
//       const o2 = {};
//       const arr = [1, o1, 2, o2];
//     `);
//   });

//   it('without hint', () => {
//     const o1 = {};
//     const o2 = {};
//     const arr = [o1, o2, o2, o1];
//     const collection = new DataCollection();
//     collection.add(arr, 'arr');
//     expect(collection).toMatchInlineSnapshot(`
//       const $ = {};
//       const $$1 = {};
//       const arr = [$, $$1, $$1, $];
//     `);
//   });
// });
