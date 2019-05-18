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
      return ${ts.val(a, 'a')};
      `.toString(),
    ).toMatchInlineSnapshot(`
      "/* #region Data */
      export const a = {thisIs: \\"A\\"};
      /* #endregion Data */

      return a;
      "
    `);
  });

  it('should serialize nested objects', () => {
    expect(
      ts`
      return ${ts.val(obj2)};
      `.toString(),
    ).toMatchInlineSnapshot(`
            "/* #region Data */
            const $d$2 = {thisIs: \\"A\\"};
            const $d$4 = {\\"and this is\\": \\"B\\", with: [1, 2, 3]};
            const $d$5 = [\\"the A:\\", $d$2, \\"and the B\\", $d$4];
            const $d$6 = {arr: $d$5, arr2: $d$5, arr3: [\\"the A:\\", $d$2, \\"and the B\\", $d$4]};
            export const $d = {a: {int123: 123, obj1: $d$6, nested: {a: $d$2, b: $d$4, ref1: $d$6}}};
            /* #endregion Data */

            return $d;
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
