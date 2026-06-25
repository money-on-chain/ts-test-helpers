# ts-test-helpers

Internal TypeScript test helpers for Money On Chain projects.

## Installation and usage

This package is intended to be consumed directly from GitHub inside Money On Chain repositories.
Install it by tag so the consuming project controls the exact version.

```json
{
  "dependencies": {
    "ts-test-helpers": "github:money-on-chain/ts-test-helpers#<tag>"
  }
}
```

The deployer helper expects proxy contracts such as `ProxyAdmin`, `TransparentUpgradeableProxy`, and `ERC1967Proxy` to be available in the consuming project's compiled contract registry. They are not shipped by this package. That keeps deployment resolution tied to the user's own registry and contract set.

## Development

Run tests with:

```bash
pnpm test
```

That command compiles the Solidity test fixtures, typechecks the repo, and runs the integration tests.

Build the package output with:

```bash
pnpm build
```

This emits the compiled library files and declarations to `dist/`. Commit the generated output when updating the package.
