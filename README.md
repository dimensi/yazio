# yazio

A lightweight, zero-dependency JavaScript/TypeScript client for the undocumented YAZIO API. Easily track calories, log items, and integrate YAZIO into your projects.

## Motivation

Built to enable personal dashboards and calendar integrations for calorie tracking. Open-sourced for community benefit.

## Getting Started

### Installing

```bash
bun add yazio
```

```
npm install yazio
```

### Usage

Here's a quick example of how to use `yazio` in your project:

```ts
// Basic Usage

import { Yazio } from "yazio";

const yazio = new Yazio({
  credentials: {
    username: "juri@acme.co",
    password: "super-secure-password",
  },
});

const items = await getConsumedItems({ date: new Date(/* ... */) });
```

```ts
// Advanced Usage

import { Yazio } from "yazio";
import { kv } from "@vercel/kv";

const yazio = new Yazio({
  // Resolve cached tokens from KV. Tokens are stored and re-used from memory
  // as long as they are still valid.
  token: kv.get("tokens:juri@acme.co"),

  // If a fresh token was received, cache it.
  onRefresh: ({ token }) =>
    kv.set("tokens:juri@acme.co", JSON.stringify(token)),

  // If no token was fetched yet, exchange the credentials for a new token.
  credentials: {
    username: "juri@acme.co",
    password: "super-secure-password",
  },
});

const summary = await yazio.user.getSummary({ date: new Date(/* ... */) });
```

See source code docs in `src/index.ts` for detailed usage. Documentation following shortly.

### Diary photos

```ts
import type { UserMealImages } from "yazio/api";

const photos: UserMealImages = await yazio.user.getMealImages({ date: "2026-10-09" });
// photos.lunch / photos.dinner are optional URLs. A day without photos returns {}.
```

`date` accepts a string or Date and defaults to today. Photos belong to a day
and meal slot, not an individual consumed item. The API returns one URL per
slot, including photos from meals with AI entries. AI entries do not always
have a photo. URLs are CDN images; original camera files and permanent URL
availability are not guaranteed.

The client sends a recognized mobile User-Agent to avoid `version_blocked`.
OAuth login/refresh uses v22 and the current mobile OAuth client configuration;
other requests continue using v20. Existing tokens are reused until expiry.
If a legacy refresh token is rejected, supply credentials to allow login fallback.
The accepted app version may need updating when YAZIO retires it.

These headers were verified in Bun; browsers may control the User-Agent header,
so direct browser calls are not validated. Credentials belong on the server.
