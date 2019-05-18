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
    expect(ts`${ts.val(a, { name: 'a' })}`.toString().trim()).toMatchInlineSnapshot(`
                                    "export const a = {thisIs: \\"A\\"};
                                    a"
                        `);
  });

  it('should serialize nested objects', () => {
    expect(ts`${ts.val(obj2, { name: 'obj2' })}`.toString().split(/\s*,\s*/))
      .toMatchInlineSnapshot(`
      Array [
        "const $$2 = {thisIs: \\"A\\"};
      const $$4 = {\\"and this is\\": \\"B\\"",
        "with: [1",
        "2",
        "3]};
      const $$5 = [\\"the A:\\"",
        "$$2",
        "\\"and the B\\"",
        "$$4];
      const $$6 = {arr: $$5",
        "arr2: $$5",
        "arr3: [\\"the A:\\"",
        "$$2",
        "\\"and the B\\"",
        "$$4]};
      export const obj2 = {a: {int123: 123",
        "obj1: $$6",
        "nested: {a: $$2",
        "b: $$4",
        "ref1: $$6}}};
      obj2",
      ]
    `);
  });

  it('should reuse same object used twice', () => {
    const code = ts`
    ${ts.val(a, { name: 'a', isExport: true })}
    ${ts.val([a, b], { name: 'arr' })}
    `;
    expect(code.toString()).toMatchInlineSnapshot(`
                        "export const a = {thisIs: \\"A\\"};
                        export const arr = [a, {\\"and this is\\": \\"B\\", with: [1, 2, 3]}];

                        a
                        arr
                        "
                `);
  });
});
