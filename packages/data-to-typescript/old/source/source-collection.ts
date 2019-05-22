// import { SourceAtom, Source } from '../template-tag/source-atom';
// import { SourceModule } from '../template-tag/source-writer';

// export class SourceCollection extends SourceAtom {
//   constructor(protected sources: Source[]) {
//     super();
//   }
//   collect(modul: SourceModule): void {
//     this.sources.forEach((src) => modul.collect(src));
//   }
//   resolve(modul: SourceModule): void {
//     this.sources.forEach((src) => {
//       if (src.resolve) src.resolve(modul);
//     });
//   }
//   getSource(modul: SourceModule): string {
//     return this.sources.map((src) => src.getSource(modul)).join('');
//   }
//   push(source: Source) {
//     this.sources.push(source);
//   }
//   toString(sourceModule?: SourceModule): string {
//     const modul = sourceModule || new SourceModule(undefined, this);
//     modul.collect(this);
//     modul.resolve();
//     return modul.getSource();
//   }
// }
