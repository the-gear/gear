// This is required because transform output must be module javascript for rollup
export default (from: string, genDefault: boolean = true) =>
  genDefault
    ? `
import _ from '${from}';
export * from '${from}';
export default _;
`
    : `
export * from '${from}';
`;
