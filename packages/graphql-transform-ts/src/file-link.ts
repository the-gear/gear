import link from 'terminal-link';

export function fileLink(text: string, path: string) {
  // TODO: escape
  return link(text, `file:${path}`);
}
