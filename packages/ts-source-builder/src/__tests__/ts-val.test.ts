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
      ts
        .val(a)
        .toString()
        .trim(),
    ).toMatchInlineSnapshot(`"{\\"thisIs\\":\\"A\\"}"`);
  });

  it('should serialize nested objects', () => {
    expect(
      ts
        .val(obj2)
        .toString()
        .trim(),
    ).toMatchInlineSnapshot(
      `"{\\"a\\":{\\"int123\\":123,\\"obj1\\":{\\"arr\\":[\\"the A:\\",{\\"thisIs\\":\\"A\\"},\\"and the B\\",{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]}],\\"arr2\\":[\\"the A:\\",{\\"thisIs\\":\\"A\\"},\\"and the B\\",{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]}],\\"arr3\\":[\\"the A:\\",{\\"thisIs\\":\\"A\\"},\\"and the B\\",{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]}]},\\"nested\\":{\\"a\\":{\\"thisIs\\":\\"A\\"},\\"b\\":{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]},\\"ref1\\":{\\"arr\\":[\\"the A:\\",{\\"thisIs\\":\\"A\\"},\\"and the B\\",{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]}],\\"arr2\\":[\\"the A:\\",{\\"thisIs\\":\\"A\\"},\\"and the B\\",{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]}],\\"arr3\\":[\\"the A:\\",{\\"thisIs\\":\\"A\\"},\\"and the B\\",{\\"and this is\\":\\"B\\",\\"with\\":[1,2,3]}]}}}}"`,
    );
  });

  it('should reuse same object used twice', () => {
    const code = ts`
    [${ts.val(a)}, ${ts.val(a)}]
    `;
    expect(
  });
});
