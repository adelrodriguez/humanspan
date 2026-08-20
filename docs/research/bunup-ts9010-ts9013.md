# Bunup support for TS9010 and TS9013

> This document records the former Bunup build. Humanspan now uses tsdown and verifies its
> generated declarations with `pnpm run build:verify`.

Research date: 2026-08-07

## Question

Does Bunup provide a documented configuration or supported fix for TypeScript diagnostics TS9010 and TS9013 during declaration generation, especially for exported const literals that contain imported numeric constants?

## Conclusion

Yes, Bunup provides one documented configuration alternative: set `dts.inferTypes` to `true`. Bunup uses isolated declarations by default. `inferTypes` switches declaration generation to the normal TypeScript compiler, which permits cross-file type inference. This is the supported escape hatch when explicit public types are impractical.

Bunup does not document a diagnostic-specific switch for TS9010 or TS9013. Its preferred fix is to keep the default isolated-declaration mode and add sufficient explicit types to public exports. The Bunup maintainer gave the same guidance for TS9010 in a first-party issue: the diagnostic is an `isolatedDeclarations` limitation, and `dts.inferTypes` is the Bunup alternative.

Humanspan uses `dts: { inferTypes: true }`. The `UNITS` export uses `as const satisfies readonly UnitDefinition[]` to preserve the literal types from which the public unit types are derived. Inferred declaration generation permits this cross-file inference while keeping those literal types. The current build completes without TS9010 or TS9013 warnings.

## Bunup findings

### Default behavior

Bunup's current declaration guide states that Bunup uses isolated declarations by default. This mode requires explicit type annotations for public exports. Bunup recommends this default for new projects because it makes declaration generation faster and makes the public API explicit.

Source: [Bunup: TypeScript Declarations — Isolated Declarations](https://bunup.dev/docs/guide/typescript-declarations#isolated-declarations)

In `bunup.config.ts`, `dts: true` enables declaration output and leaves the declaration options at their defaults. Humanspan does not use this default configuration because its public unit types depend on inference from the `UNITS` table.

Project source: [`bunup.config.ts`](../../bunup.config.ts)

### Documented configuration alternative

Bunup documents this configuration:

```ts
export default defineConfig({
  dts: {
    inferTypes: true,
  },
})
```

The guide states that `inferTypes` switches from isolated declarations to traditional TypeScript compilation. This permits automatic type inference. Bunup says to use it when explicit typing is verbose or impractical, not as the preferred default.

Source: [Bunup: TypeScript Declarations — Infer Types](https://bunup.dev/docs/guide/typescript-declarations#infer-types)

Bunup also documents `dts.tsgo`, but only together with `inferTypes`. It changes which TypeScript compiler performs inferred declaration generation. It is a performance option, not a separate fix for TS9010 or TS9013.

Source: [Bunup: TypeScript Declarations — Tsgo](https://bunup.dev/docs/guide/typescript-declarations#tsgo)

### First-party issue guidance

Bunup issue [#83](https://github.com/bunup/bunup/issues/83) reports TS9010 for a complex exported const. A Bunup collaborator states that this is an `isolatedDeclarations` limitation and directs the reporter to `dts.inferTypes`. This supports the documentation's two choices:

1. Add a sufficient explicit public type and keep isolated declarations.
2. Enable `dts.inferTypes` when inference is necessary.

Source: [Bunup issue #83 maintainer response](https://github.com/bunup/bunup/issues/83#issuecomment-3415065527)

A search of the first-party Bunup issue tracker for TS9010 or TS9013 found this TS9010 issue. It did not find separate Bunup guidance for TS9013. Therefore, the current official declaration guide is the primary supported guidance for both diagnostics.

## TypeScript findings

TypeScript defines the diagnostics as follows:

- TS9010: `Variable must have an explicit type annotation with --isolatedDeclarations.`
- TS9013: `Expression type can't be inferred with --isolatedDeclarations.`

Source: [TypeScript diagnostic messages](https://github.com/microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json#L7440-L7458)

The official `isolatedDeclarations` reference says the option requires enough annotation on exports for other tools to generate declarations without a full type-checking pass.

Source: [TypeScript TSConfig reference: `isolatedDeclarations`](https://www.typescriptlang.org/tsconfig/isolatedDeclarations.html)

The TypeScript 5.5 release notes explain the reason for these diagnostics. A declaration tool that processes one file cannot follow imported values to infer an exported type. TypeScript recommends explicit public types. It also notes that some literal expressions have trivial types, but cross-file inference does not.

Source: [TypeScript 5.5: Isolated Declarations](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/#isolated-declarations)

TypeScript's own quick-fix messages include adding a variable type annotation and making an expression explicit with `satisfies T as T`. Bunup does not document these as Bunup options; they are source-level TypeScript fixes.

Source: [TypeScript diagnostic and quick-fix messages](https://github.com/microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json#L7440-L7555)

## Comparison with Humanspan

### `bunup.config.ts`

The project has:

```ts
export default defineConfig({
  dts: {
    inferTypes: true,
  },
  entry: ["src/index.ts"],
  // ...
})
```

This enables declarations through the normal TypeScript compiler instead of Bunup's default isolated-declaration behavior.

Project source: [`bunup.config.ts`](../../bunup.config.ts)

### `src/lib/units.ts`

`UNITS` is an exported const literal with imported numeric constants such as `MS_PER_YEAR`:

```ts
export const UNITS = [
  {
    // ...
    ms: MS_PER_YEAR,
    // ...
  },
] as const satisfies readonly UnitDefinition[]
```

The `satisfies` clause checks each entry against `UnitDefinition`, while `as const` preserves the precise alias, long name, plural name, and short name types. Humanspan derives its public unit types from those literals. The `inferTypes` setting lets declaration generation follow the imported numeric constants without replacing the table's precise type with a broad annotation.

Project source: [`src/lib/units.ts`](../../src/lib/units.ts)

### Verification

Command run:

```sh
bun run build
```

Result with Bunup `0.16.32`, Bun `1.3.14`, and the current source: success. Bunup generated `dist/index.js` and `dist/index.d.ts` without TS9010 or TS9013 warnings.

## Decision guidance

- Keep `dts: { inferTypes: true }` while Humanspan derives public types from the precise `UNITS` literals.
- Consider the default isolated-declaration mode only if `UNITS` can receive a practical explicit type without losing required literal information.
- Do not expect a Bunup option that suppresses only TS9010 or TS9013. No such option is documented in the current official guide.
- Treat imported numeric constants as a cross-file inference concern when an exported expression depends on their inferred types. The current `inferTypes` setting resolves that concern for `UNITS`.
