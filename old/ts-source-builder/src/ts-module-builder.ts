import { CompilerOptions } from 'typescript';
import { TranspileOutput, transpileModule } from './transpiler';
import { SourceModule } from './source/source-module';

export class TsModuleBuilder extends SourceModule {
  constructor(moduleName: string = 'no-name', public compilerOptions: CompilerOptions = {}) {
    super(moduleName);
  }

  /**
   * cache
   */
  private tsCode: string | null = null;
  private transpileOutput: TranspileOutput | null = null;

  invalidate() {
    this.tsCode = null;
    this.transpileOutput = null;
  }

  getTsCode(): string {
    if (this.tsCode) {
      return this.tsCode;
    }
    this.tsCode = this.getSource();
    return this.tsCode;
  }

  getTranspileOutput(): TranspileOutput {
    if (this.transpileOutput) return this.transpileOutput;

    const tsCode = this.getTsCode();

    const transpileOutput = transpileModule(tsCode, {
      compilerOptions: this.compilerOptions,
      fileName: this.moduleName,
      moduleName: this.getModuleName(),
    });

    const { diagnostics } = transpileOutput;
    if (diagnostics && diagnostics.length) {
      console.warn(`Typescript messages in ${this.getModuleName()}`);
      diagnostics.forEach((diag) => {
        console.warn(`${diag.messageText}`);
      });
    }

    this.transpileOutput = transpileOutput;
    return transpileOutput;
  }

  getJsCode(): string {
    return this.getTranspileOutput().outputText;
  }

  getDeclaration(): string {
    return this.getTranspileOutput().declarationText;
  }
}
