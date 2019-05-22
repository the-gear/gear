// import { isPrimitiveValue, getPropertyName, getPropertyAccess } from './utils';
// import { Identifier, IdentifierOptions } from '../template-tag/identifier';
// import { SourceModule } from '../template-tag/source-writer';

// export type DataRefConfig = {
//   data: unknown;
//   identifiers: Identifier[];
//   seen: number;
// };

// export class DataRef implements DataRefConfig {
//   data: unknown;
//   identifiers: Identifier[] = [];
//   writtenName?: string;
//   isWriting: boolean = false;
//   seen: number = 1;
//   children = new Set<DataRef>();

//   constructor(data: unknown, ident?: IdentifierOptions) {
//     this.data = data;
//     if (ident) {
//       this.identifiers.push(new Identifier(ident));
//     }
//   }

//   getIdentifier(ident?: IdentifierOptions): Identifier {
//     if (this.identifiers.length) {
//       console.log('IDENTIFIERS:', this.identifiers.map((id) => id.name));
//       return this.identifiers[0];
//     }
//     const id = new Identifier(ident);
//     this.identifiers.push(id);
//     return id;
//   }
// }

// export class DataCollection {
//   private refs = new Map<unknown, DataRef | null>();

//   constructor(private modul: SourceModule = new SourceModule()) {}

//   public add(data: unknown, ident?: IdentifierOptions, children?: Set<DataRef>): DataRef {
//     let ref = this.refs.get(data);
//     if (ref) {
//       ref.seen++;
//       if (ident) {
//         ref.identifiers.push(new Identifier(ident));
//       }

//       return ref;
//     } else {
//       ref = new DataRef(data, ident);
//       this.refs.set(data, ref);
//     }
//     if (children) children.add(ref);

//     if (typeof data === 'object' && data !== null) {
//       const addRecursive = (val: unknown) => {
//         this.add(val, undefined, (ref as DataRef).children);
//       };
//       if (Array.isArray(data)) {
//         data.forEach(addRecursive);
//       } else {
//         Object.values(data).forEach(addRecursive);
//       }
//     }

//     return ref;
//   }

//   public getTsCode() {
//     const code: string[] = [];
//     for (const [value, ref] of this.refs) {
//       if (ref && ref.identifiers.length) {
//         this.getCodeForRef(ref, value, code);
//       }
//     }
//     return code.join('\n');
//   }

//   public toString() {
//     return this.getTsCode();
//   }

//   private id: number = 1;

//   public getFreeId() {
//     return `$$${(this.id++).toString(36)}`;
//   }

//   public getDataRef(data: unknown): DataRef {
//     let dataRef = this.refs.get(data);
//     return dataRef ? dataRef : this.add(data);
//   }

//   private getCodeForRef(ref: DataRef, value: unknown, code: string[], onlyChildren?: boolean) {
//     if (ref.writtenName) return;

//     ref.isWriting = true;
//     for (const child of ref.children) {
//       this.getCodeForRef(child, child.data, code, true);
//     }

//     if (onlyChildren && ref.seen < 2) return;

//     const firstIdent = ref.getIdentifier();
//     const firstName = firstIdent.getSource(this.modul);

//     const append: string[] = [];
//     const serialized = this.serialize(value, firstName, append);
//     const isPrimitive = isPrimitiveValue(value);
//     if (isPrimitive) {
//       for (let i = 0; i < ref.identifiers.length; i++) {
//         const ident = ref.identifiers[i];
//         const name = ident.getSource(this.modul);
//         const exportStr = ident.isExported ? 'export ' : '';
//         code.push(`${exportStr}const ${name} = ${serialized};`);
//       }
//     } else {
//       const exportStr = firstIdent.isExported ? 'export ' : '';
//       code.push(`${exportStr}const ${firstName} = ${serialized};`);
//       if (append.length) {
//         code.push(append.join('\n'));
//       }
//       for (let i = 1; i < ref.identifiers.length; i++) {
//         const ident = ref.identifiers[i];
//         const name = ident.getSource(this.modul);
//         const exportStr = ident.isExported ? 'export ' : '';
//         code.push(`${exportStr}const ${name} = ${firstName};`);
//       }
//     }
//     ref.isWriting = false;
//   }

//   serialize(data: unknown, path: string, append: string[]): string {
//     switch (typeof data) {
//       case 'undefined': {
//         return 'undefined';
//       }

//       case 'string':
//       case 'number':
//       case 'boolean': {
//         return JSON.stringify(data);
//       }

//       case 'bigint': {
//         return `BigInt("${data.toString()}")`;
//       }

//       case 'object': {
//         if (data === null) return 'null';

//         const ref = this.refs.get(data);
//         if (ref) {
//           if (ref.writtenName) {
//             if (ref.isWriting) {
//               append.push(`${path} = ${ref.writtenName};`);
//               if (Array.isArray(ref.data)) {
//                 return `[ /* recursive ${ref.writtenName} */ ]`;
//               } else {
//                 return `{ /* recursive ${ref.writtenName} */ }`;
//               }
//             } else {
//               return ref.writtenName;
//             }
//           } else {
//             ref.writtenName = path;
//           }
//         }

//         if (Array.isArray(data)) {
//           return `[${data
//             .map((value, idx) => this.serialize(value, path + getPropertyAccess(idx), append))
//             .join(', ')}]`;
//         }

//         const keyVals = [];
//         for (const [key, value] of Object.entries(data)) {
//           keyVals.push(
//             `${getPropertyName(key)}: ${this.serialize(
//               value,
//               path + getPropertyAccess(key),
//               append,
//             )}`,
//           );
//         }

//         return `{${keyVals.join(', ')}}`;
//       }

//       case 'symbol': {
//         // Well, I can register symbols on module and emit reference here, but...
//         return `undefined /* ${data.toString().replace(/\*\//g, '* /')} */`;
//       }

//       case 'function': {
//         return `undefined /* ${data.toString().replace(/\*\//g, '* /')} */`;
//       }

//       default: {
//         /* istanbul ignore next */
//         throw new Error(`[ts-source-builder] Unhandled case of type ${typeof data}`);
//       }
//     }
//   }
// }
