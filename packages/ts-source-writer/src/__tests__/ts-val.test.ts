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
                  const a = {thisIs: \\"A\\"};
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
      const $$2 = \\"the A:\\";
      const $$3 = {thisIs: \\"A\\"};
      const $$5 = \\"and the B\\";
      const $$6 = {\\"and this is\\": \\"B\\", with: [1, 2, 3]};
      const $$7 = [\\"the A:\\", $$3, \\"and the B\\", $$6];
      const $$8 = {arr: $$7, arr2: $$7, arr3: [\\"the A:\\", $$3, \\"and the B\\", $$6]};
      const $$9 = {a: {int123: 123, obj1: $$8, nested: {a: $$3, b: $$6, ref1: $$8}}};
      const $$b = \\"the A:\\";
      const $$d = \\"and the B\\";
      /* #endregion Data */

      return $;
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
                  const a = {thisIs: \\"A\\"};
                  const arr = [a, {\\"and this is\\": \\"B\\", with: [1, 2, 3]}];
                  /* #endregion Data */

                  return [
                    a,
                    arr
                  ]
                  "
            `);
  });
});
