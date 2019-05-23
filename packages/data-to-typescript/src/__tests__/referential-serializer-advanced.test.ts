import { ReferentialSerializer } from '../referential-serializer';
import { runInNewContext } from 'vm';

const serialize = (value: unknown) => new ReferentialSerializer().serialize(value);
const evalStr = (code: string) => runInNewContext(code);
// const serializeThenEval = (value: unknown) => evalStr('(' + serialize(value) + ')');

describe('ReferentialSerializer (advanced)', () => {
  it('can serialize objects and arrays', () => {
    const obj = { int: 1, str: 'abc', null: null };
    const arr = [obj, obj, 1, 'abc', null, {}, []];

    const serializer = new ReferentialSerializer();
    const strObj = serializer.serialize(obj);
    expect(strObj).toMatchInlineSnapshot(`"{int:1,str:\\"abc\\",null:null}"`);

    serializer.setReplace(obj, 'obj');
    const strArr = serializer.serialize(arr);
    expect(strArr).toMatchInlineSnapshot(`"[obj,obj,1,\\"abc\\",null,{},[]]"`);

    const code = `
      const obj = ${strObj};
      ${strArr}
    `;

    const evaluated = evalStr(code);
    expect(evaluated).toEqual(arr);
    expect(evaluated[0] === evaluated[1]).toStrictEqual(true);
  });

  it('can serialize registered string', () => {
    const str = 'custom string';
    const serializer = new ReferentialSerializer();
    serializer.setReplace(str, "['custom', 'string'].join(' ')");
    const serializedStr = serializer.serialize(str);
    expect(serializedStr).toMatchInlineSnapshot(`"['custom', 'string'].join(' ')"`);
    const evaluatedStr = evalStr(`(${serializedStr})`);
    expect(evaluatedStr).toEqual(str);
  });

  it('can serialize registered function', () => {
    const obj = {
      name: 'test',
      getName() {
        return this.name;
      },
    };
    const serializer = new ReferentialSerializer();
    serializer.setReplace(obj.getName, 'function getName() { return this.name; }');
    const strObj = serializer.serialize(obj);
    expect(strObj).toMatchInlineSnapshot(
      `"{name:\\"test\\",getName:function getName() { return this.name; }}"`,
    );

    const evaluated = evalStr(`(${strObj})`);
    expect(evaluated.getName()).toEqual(obj.name);
  });

  it('can serialize registered symbol', () => {
    const customSymbol = Symbol.for('ref-test');
    const obj = {
      symb: customSymbol,
      [customSymbol]: 'test',
    };
    const serializer = new ReferentialSerializer();
    serializer.setReplace(customSymbol, "Symbol.for('ref-test')");
    const strObj = serializer.serialize(obj);
    expect(strObj).toMatchInlineSnapshot(`"{symb:Symbol.for('ref-test')}"`);

    const evaluated = evalStr(`(${strObj})`);
    expect(evaluated.symb).toStrictEqual(customSymbol);
  });

  it('throws on recursion', () => {
    const a = { ref: {} };
    a.ref = a;
    expect(() => serialize(a)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $.ref = $"`,
    );

    const b = { a: { b: { c: a } } };
    expect(() => serialize(b)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $.a.b.c.ref = $.a.b.c"`,
    );

    const arr1 = [a];
    expect(() => serialize(arr1)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $[0].ref = $[0]"`,
    );

    const arr2 = [, b, a];
    expect(() => serialize(arr2)).toThrowErrorMatchingInlineSnapshot(
      `"Recursion detected: $[1].a.b.c.ref = $[1].a.b.c"`,
    );
  });
});
