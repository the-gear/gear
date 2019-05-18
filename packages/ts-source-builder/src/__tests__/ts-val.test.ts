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
    expect(ts`${ts.val(a, { name: 'a' })}`.toString()).toMatchInlineSnapshot(`
                  "/* #region Data */
                  export const a = {thisIs: \\"A\\"};
                  /* #endregion Data */
                  a"
            `);
  });

  it('should serialize nested objects', () => {
    expect(
      ts`
      console.log(${ts.val(obj2, { name: 'obj2' })});
      `.toString(),
    ).toMatchInlineSnapshot(`
      "/* #region Data */
      const $d$1 = {thisIs: \\"A\\"};
      const $d$3 = {\\"and this is\\": \\"B\\", with: [1, 2, 3]};
      const $d$4 = [\\"the A:\\", $d$1, \\"and the B\\", $d$3];
      const $d$5 = {arr: $d$4, arr2: $d$4, arr3: [\\"the A:\\", $d$1, \\"and the B\\", $d$3]};
      export const obj2 = {a: {int123: 123, obj1: $d$5, nested: {a: $d$1, b: $d$3, ref1: $d$5}}};
      /* #endregion Data */

      console.log(obj2);
      "
    `);
  });

  it('should reuse same object used twice', () => {
    const code = ts`
    ${ts.val(a, { name: 'a', isExport: true })}
    ${ts.val([a, b], { name: 'arr' })}
    `;
    expect(code.toString()).toMatchInlineSnapshot(`
                  "/* #region Data */
                  export const a = {thisIs: \\"A\\"};
                  export const arr = [a, {\\"and this is\\": \\"B\\", with: [1, 2, 3]}];
                  /* #endregion Data */

                  a
                  arr
                  "
            `);
  });
});

console.log(obj2);
