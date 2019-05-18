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
    expect(ts`${ts.val(a)}`.toString().trim()).toMatchInlineSnapshot(`
      "const gen$ = gen$;
      {
        thisIs: \\"A\\"}"
    `);
  });

  it('should serialize nested objects', () => {
    expect(ts`${ts.val(obj2)}`.toString().trim()).toMatchSnapshot();
  });

  it('should reuse same object used twice', () => {
    const code = ts`
    ${ts.val(a, { name: 'a', isExport: true })}
    [${ts.val(a)}, ${ts.val(a)}]
    `;
    expect(code.toString()).toMatchInlineSnapshot(`
      "const a = a;

      a
      [a, a]
      "
    `);
  });
});
