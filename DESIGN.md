### 1 — High-level overview

Telenome’s MVP is basically a **thin, opinionated “launcher & explorer” for Seer markets running on Gnosis mainnet**.
Instead of trying to reproduce Seer’s full trading UX, we focus on the two activities that make Telenome distinctive:

| Activity                                                 | What users actually do                                                                                                                                                                                                                                                                                                  | Why it matters                                                                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Market creation with an explicit “impact metric” tag** | Fill in a short form that (a) picks or writes an *impact-metric template* (a simple string such as “Will this paper be cited ≥ 100 times by 2030-01-01?”), (b) writes a free-text rationale, and (c) submits one `create…Market()` call to Seer’s `MarketFactory` contract together with an initial collateral deposit. | The template gives the market a machine-readable anchor, letting us group & surface “markets about the same thing” later without NLP. |
| **Market discovery & filtering**                         | Query the Seer sub-graph, filter by template slug (or free search), show cards that link straight to the live market on seer.pm.                                                                                                                                                                                        | Lets researchers or funders quickly spot “top-predicted high-impact” ideas without leaving Telenome.                                  |

Everything else—trading, dispute resolution, settlement—is delegated to **Seer contracts + reality.eth** (already audited and live) and Seer’s own web front-end.

#### Key design decisions

* **Front-end only, no bespoke contracts** – we interact with Seer’s contracts directly from the client via wagmi. This means the whole MVP is a Next.js/Typescript app living inside your scaffold-eth-2 repo.
* **Gnosis mainnet only (chainId 100)** – rpc/url configuration is added to the existing wagmi setup; faucet, tests and testnets are stripped out.
* **Impact-metric templates stored client-side** – start with a small JSON file; each entry has `slug`, `label`, `description`. Users can also type a custom template that becomes the market’s `category` string in Seer, prefixed with `telenome:` so we can query it later.
* **Data layer = Seer subgraph** – the Graph ID `B4vyRq…DxWH` on the Gnosis network already indexes all `Market` entities; we just add a tiny GraphQL helper to fetch by `category` ([The Graph][1]).
* **Liquidity helper** – a minimal form calls `GnosisRouter.addLiquidity()` (or the equivalent function exposed by Seer) so the market starts with depth; afterwards we simply display the pool status but leave further LP management to Seer’s UI.
* **Routing** – three new pages under `/telenome/**`:
  `/create`, `/liquidity/[address]`, `/markets`.  Navigation is added to the existing `Header.tsx`.

The result is a **very small surface area**: about half-a-dozen React components, two contract ABIs, and one GraphQL helper, yet it already lets users spin up tagged impact markets and browse them.


## Seer documentation

https://seer-3.gitbook.io/seer-documentation/developers/interact-with-seer/resolve-a-market
https://seer-3.gitbook.io/seer-documentation/developers/interact-with-seer/create-a-market
https://seer-3.gitbook.io/seer-documentation/developers/interact-with-seer/market-example
https://seer-3.gitbook.io/seer-documentation/developers/intro

## Seer subgraph documentation (it is on gnosis even if the urls says arbitrum)
https://seer-3.gitbook.io/seer-documentation/developers/subgraph/subgraph-id
https://seer-3.gitbook.io/seer-documentation/developers/subgraph/query-examples
https://seer-3.gitbook.io/seer-documentation/developers/subgraph/graphql-query/curate
https://seer-3.gitbook.io/seer-documentation/developers/subgraph/graphql-query/swapr
https://seer-3.gitbook.io/seer-documentation/developers/subgraph/graphql-schema