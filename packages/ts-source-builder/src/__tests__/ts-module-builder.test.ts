import { TsModuleBuilder } from '../ts-module-builder';
import { ts } from '../template-tag';
import { ModuleKind } from 'typescript';

describe('TsModuleBuilder', () => {
  it('can be imported and instantiated', () => {
    expect(TsModuleBuilder).toBeDefined();
    const modul = new TsModuleBuilder();
    expect(modul).toBeDefined();
  });

  it('should generate typescript', () => {
    const modul = new TsModuleBuilder('test-ts');
    modul.add(ts`export const greeter: string 'Ahoj!'`);
    expect(modul.getTsCode()).toMatchInlineSnapshot(`"export const greeter: string 'Ahoj!'"`);
  });

  it('should generate javascript - commonjs', () => {
    const modul = new TsModuleBuilder('test-js');
    modul.add(ts`export const greeter: string = 'Ahoj!'`);
    expect(modul.getJsCode().trim()).toMatchInlineSnapshot(`
            "\\"use strict\\";
            exports.__esModule = true;
            exports.greeter = 'Ahoj!';"
        `);
  });

  it('should import module for side effect', () => {
    const src = ts`${ts.import('source-map-support/register', null, null)}`;
    expect(src.toString().trim()).toMatchInlineSnapshot(
      `"import \\"source-map-support/register\\";"`,
    );
  });

  it('should generate javascript - ES2015', () => {
    const modul = new TsModuleBuilder('test-js', {
      module: ModuleKind.ES2015,
      preferConst: true,
    });
    modul.add(ts`export const greeter: string = 'Ahoj!'`);
    expect(modul.getJsCode().trim()).toMatchInlineSnapshot(`"export var greeter = 'Ahoj!';"`);
  });

  it('should generate declarations', () => {
    const modul = new TsModuleBuilder('test-decl', {
      declaration: true,
    });
    modul.add(ts`export const greeter: string = 'Ahoj!'`);
    expect(modul.getDeclaration().trim()).toMatchInlineSnapshot(`
            "/// <amd-module name=\\"test-decl\\" />
            export declare const greeter: string;"
        `);
  });

  it('should infer declarations', () => {
    const modul = new TsModuleBuilder('test-decl-infer', {
      declaration: true,
    });
    modul.add(ts`export const greeter = 'Ahoj!'`);
    expect(modul.getDeclaration().trim()).toMatchInlineSnapshot(`
            "/// <amd-module name=\\"test-decl-infer\\" />
            export declare const greeter = \\"Ahoj!\\";"
        `);
  });

  it('should reexport declarations', () => {
    const modul = new TsModuleBuilder('test-decl-reexport', {
      declaration: true,
    });
    const sourceId = ts.import('graphql', 'Source');
    modul.add(ts`export const src: ${sourceId} = new ${sourceId}('{hello}');`);
    expect(modul.getDeclaration().trim()).toMatchInlineSnapshot(`
            "/// <amd-module name=\\"test-decl-reexport\\" />
            import { Source } from \\"graphql\\";
            export declare const src: Source;"
        `);
  });
});
