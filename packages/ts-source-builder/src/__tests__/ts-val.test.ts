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
        "export const obj2 = {a: {int123: 123",
        "obj1: {arr: [\\"the A:\\"",
        "{thisIs: \\"A\\"}",
        "\\"and the B\\"",
        "{\\"and this is\\": \\"B\\"",
        "with: [1",
        "2",
        "3]}]",
        "arr2: obj2.a.obj1.arr",
        "arr3: [\\"the A:\\"",
        "obj2.a.obj1.arr[1]",
        "\\"and the B\\"",
        "obj2.a.obj1.arr[3]]}",
        "nested: {a: obj2.a.obj1.arr[1]",
        "b: obj2.a.obj1.arr[3]",
        "ref1: obj2.a.obj1}}};
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
