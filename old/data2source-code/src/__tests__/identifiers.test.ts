import { Identifiers } from '../identifiers';

describe('Identifiers', () => {
  it('can set name', () => {
    const idents = new Identifiers<string>();
    idents.getFor('val1').setName('name1');
  });

  it('can get name', () => {
    const idents = new Identifiers<string>();
    const ref1 = idents.getFor('val1').setName('name1');
    const ref2 = idents.getFor('val2').setName('name2');
    expect(ref1.getName()).toEqual('name1');
    expect(ref2.getName()).toEqual('name2');
  });

  it('select shortest name, then alphabetically if same length', () => {
    const idents = new Identifiers<string>();
    const ref = idents
      .getFor('val1')
      .setName('aa')
      .setName('b')
      .setName('a')
      .setName('c')
      .setName('cc');
    expect(ref.getName()).toEqual('a');
  });

  it('select export name first', () => {
    const idents = new Identifiers<string>();
    const ref = idents
      .getFor('val1')
      .setName('aa')
      .setName('b')
      .setName('a')
      .setName('exportName', true)
      .setName('cc');
    expect(ref.getName()).toEqual('exportName');
  });

  it('select best matching suggestions', () => {
    const idents = new Identifiers<string>();
    idents.getFor('code').suggestNames(['code', 'obj1$code']);
    idents.getFor('code').suggestNames(['code', 'obj2$code']);
    idents.getFor('src1').suggestNames(['src', 'obj3$src']);
    idents.getFor('src2').suggestNames(['src', 'obj4$src']);
    idents.getFor('anonym1');
    idents.getFor('anonym2');
    idents.getFor('circ1').suggestNames(['circ']);
    idents.getFor('circ2').suggestNames(['circ']);
    expect(idents.getFor('code').getName()).toEqual('code');
    expect(idents.getFor('src1').getName()).toEqual('obj3$src');
    expect(idents.getFor('src2').getName()).toEqual('obj4$src');
    expect(idents.getFor('anonym1').getName()).toEqual('$$1');
    expect(idents.getFor('anonym2').getName()).toEqual('$$2');
    expect(idents.getFor('circ1').getName()).toEqual('circ$1');
    expect(idents.getFor('circ2').getName()).toEqual('circ$2');
  });
});
