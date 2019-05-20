# Jak to muze fungovat

- `ts` template tag vytvori fragment — pouze neco jako AST.

- Kazdy vystup z `ts` (`TsSource`) ma metodu `toString`:
```ts
toString() {
  return new SourceResolver(this).toString();
}
```

to znamena, ze v jakekoliv fazi lze projit cely kod sestaveny
z `ts` template tagu. SourceResolver se stara o setaveni vseho duleziteho,
mozna pomoci WeakMap a WeakSet
