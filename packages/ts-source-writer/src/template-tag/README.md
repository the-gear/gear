# Jak to muze fungovat

- `ts` template tag vytvori fragment — pouze neco jako AST.

- Kazdy vystup z `ts` (`TsSource`) ma metodu `toString`:
```ts
toString() {
  return new SourceWriter(this).toString();
}
```

to znamena, ze v jakekoliv fazi lze projit cely kod sestaveny
z `ts` template tagu. SourceWriter se stara o setaveni vseho duleziteho,
mozna pomoci WeakMap a WeakSet
