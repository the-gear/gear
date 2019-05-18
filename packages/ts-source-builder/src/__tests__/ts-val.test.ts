import { ts } from '../template-tag';

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

describe('ts.val', () => {
  it('should serialize simple object', () => {
    expect(
      ts`
      return ${ts.val(a)};
      `.toString(),
    ).toMatchInlineSnapshot(`
      "
      return ;
      "
    `);
  });

  it('should serialize nested objects', () => {
    expect(
      ts`
      return ${ts.val(obj2)};
      `.toString(),
    ).toMatchInlineSnapshot(`
      "
      return ;
      "
    `);
  });

  it('should reuse same object used twice', () => {
    const code = ts`
    return [
      ${ts.val(a, { name: 'a', isExport: true })},
      ${ts.val([a, b], { name: 'arr' })}
    ]
    `;
    expect(code.toString()).toMatchInlineSnapshot(`
      "/* #region Data */
      export const a = {thisIs: \\"A\\"};
      export const arr = [a, {\\"and this is\\": \\"B\\", with: [1, 2, 3]}];
      /* #endregion Data */

      return [
        a,
        arr
      ]
      "
    `);
  });
});
