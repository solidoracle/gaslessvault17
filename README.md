# ⛽💨 Gasless Vault

## Overview

Defi ERC4626 vault that holds WETH.

Uses Biconomy truested forwarder setup to enable gassless transactions.

Dapp uses both SDK and API approach, both with Personal Sign and Private Key utilisation

## Deployment

Create an .env file using the .env.example file as a template.

Then run in both the /packages folders respectively:

```bash
  yarn install
```

To start the app

```bash
  cd packages/dapp
  yarn start
```

## Tests

To run tests, run the following command

```bash
  cd packages/hardhat
  forge test
```
