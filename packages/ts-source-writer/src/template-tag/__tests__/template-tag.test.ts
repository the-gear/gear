import { ts } from '../template-tag';

describe('`ts` template tag', () => {
  it('can be imported', () => {
    expect(ts).toBeDefined();
  });

  it('can handle literate string', () => {
    expect(ts`export const numConst = 1;`.toString()).toEqual('export const numConst = 1;');
  });

  it('can handle number', () => {
    expect(ts`export const intConst = ${ts.value(2)};`.toString()).toEqual(
      'export const intConst = 2;',
    );
  });

  it('can handle string', () => {
    expect(ts`export const strConst = ${ts.value(':-)')};`.toString()).toEqual(
      'export const strConst = ":-)";',
    );
  });

  it('can handle bool', () => {
    expect(ts`export const boolConst = ${ts.value(true)};`.toString()).toEqual(
      'export const boolConst = true;',
    );
    expect(ts`export const boolConst = ${ts.value(false)};`.toString()).toEqual(
      'export const boolConst = false;',
    );
  });

  it('can handle null', () => {
    expect(ts`/* ${null} */`.toString()).toEqual('/*  */');
  });

  it('can handle nested source', () => {
    const id = ts.id('mineId');
    const val = ts`123`;
    expect(ts`export const ${id} = ${val};`.toString()).toEqual(`export const mineId = 123;`);
  });

  it('should rename identifiers properly', () => {
    const id1 = ts.id('mineId');
    const id2 = ts.id();
    const id3 = ts.id();
    const src = ts`
      [
        ${id1}, ${id2}, ${id3},
        ${id1}, ${id2}, ${id3},
      ]
    `;
    expect(src.toString().trim()).toMatchInlineSnapshot(`
      "const a = [
          mineId$1, mineId$2, mineId,
          mineId$1, mineId$2, mineId,
        ];
        const $ = $$1"
    `);
  });

  // it('should import identifiers properly 1', () => {
  //   const src = ts`
  //     ${ts.import('a', 'b', 'c')}.inspect();
  //     ${ts.import('util', null, 'util')}.inspect();
  //   `;
  //   expect(src.toString()).toMatchInlineSnapshot(`
  //                 "import { b as c } from \\"a\\";
  //                 import util from \\"util\\";

  //                   c.inspect();
  //                   util.inspect();
  //                 "
  //           `);
  // });

  // it('should import identifiers properly 2', () => {
  //   const src = ts`
  //   ${ts.import('util')}.inspect();
  //   ${ts.import('util', null, 'util')}.inspect();
  //   ${ts.import('util', null, 'util', true)}.inspect();
  //   ${ts.import('util')}.inspect();
  //   ${ts.import('util', 'debuglog')}('test');
  //   `;
  //   expect(src.toString()).toMatchInlineSnapshot(`
  //                 "import util, { debuglog } from \\"util\\";

  //                 util.inspect();
  //                 util.inspect();
  //                 util.inspect();
  //                 util.inspect();
  //                 debuglog('test');
  //                 "
  //           `);
  // });
});
