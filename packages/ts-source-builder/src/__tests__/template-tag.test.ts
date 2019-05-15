import { ts } from '../template-tag';

describe('`ts` template tag', () => {
  it('can be imported', () => {
    expect(ts).toBeDefined();
  });

  it('can handle literate string', () => {
    expect(ts`export const numConst = 1;`.toString()).toEqual('export const numConst = 1;');
  });

  it('can handle number', () => {
    expect(ts`export const intConst = ${2};`.toString()).toEqual('export const intConst = 2;');
  });

  it('can handle string', () => {
    expect(ts`export const strConst = ${':-)'};`.toString()).toEqual(
      'export const strConst = ":-)";',
    );
  });

  it('can handle bool', () => {
    expect(ts`export const boolConst = ${true};`.toString()).toEqual(
      'export const boolConst = true;',
    );
    expect(ts`export const boolConst = ${false};`.toString()).toEqual(
      'export const boolConst = false;',
    );
  });

  it('can handle null', () => {
    expect(ts`export const nullConst = ${null};`.toString()).toEqual(
      'export const nullConst = null;',
    );
  });

  it('can handle nested source', () => {
    const id = ts.id('mineId');
    const val = ts.val(123);
    expect(ts`export const ${id} = ${val};`.toString()).toEqual(`export const mineId = 123;`);
  });

  it('should rename identifiers properly', () => {
    const id1 = ts.id('mineId');
    const id2 = ts.id('mineId');
    const fixedId = ts.id('mineId', true);
    const id4 = ts.id();
    const id5 = ts.id();
    const src = ts`
      const a = [
        ${id1}, ${id2}, ${fixedId},
        ${id1}, ${id2}, ${fixedId},
      ];
      const ${id4} = ${id5}
    `;
    expect(src.toString()).toMatchInlineSnapshot(`
      "
            const a = [
              mineId$1, mineId$2, mineId,
              mineId$1, mineId$2, mineId,
            ];
            const gen$ = gen$$1
          "
    `);
  });
});
