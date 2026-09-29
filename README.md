s# AlphaFilter

A live desk that watches Solana launch tape, extracts contract addresses the way a Telegram call channel would, then runs a second-layer on-chain and market score before anything is called “potential good.”

## What you see

- **Pulse** — telegram-style alerts on the left, pipeline columns on the right: extracted → enriching → analyzing → passed / rejected
- **Passed** — survivors only, with OpenSea, DexScreener, Solscan, and Jupiter links
- **Token** — score breakdown, kill flags, holder map, source alert
- **Channels** — enable, add, or drop desks
- **Analytics / Settings** — pass rate, weights, threshold

## Scoring

Weighted 0–100, normalized at score time:

| Check | Default |
| --- | --- |
| Deployer trail | 15 |
| Fresh wallets | 12 |
| Holder concentration | 15 |
| Bundle / launch clustering | 15 |
| LP quality | 12 |
| Mint & freeze | 12 |
| Liquidity & size | 10 |
| Organic flow | 9 |

Kill flags (mint+freeze live, no book, whale bag) reject regardless of score. Each line is tagged **on-chain**, **market**, or **modeled**.

## Data

- GeckoTerminal new/trending Solana pools feed the tape
- DexScreener for price, depth, volume, pair age
- Solana RPC for mint/freeze and largest accounts

Paste any Solana mint in the inspect bar to run the same pipe.
