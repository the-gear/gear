import { JsDataWriter } from '../js-data-writer';

describe('JsDataWriter', () => {
  it('throws on distinct duplicate export', () => {
    const writer = new JsDataWriter();
    writer.addExports({ a: 1 });
    // it is perfectly valid to call addExports with exactly same value
    writer.addExports({ a: 1 });
    // However it is not valid to redeclare export
    expect(() => writer.addExports({ a: 2 })).toThrowErrorMatchingInlineSnapshot(
      `"Cannot redeclare export a"`,
    );
  });
});
