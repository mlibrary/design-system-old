# ADR 2. NPM Publish Prereleases

March 15, 2021

## Context

We wanted a structured way to collaborate on prereleases over a CDN, to enable development of new components and styles across our projects.

## Decisions

We will through a Github Action, we are watching changes to the `dev` branch and will deploy those automatically.

To use these development prereleases then use the `@prerelease` tag:

```
<link href="https://unpkg.com/@umich-lib/css@prerelease/dist/umich-lib.css" rel="stylesheet"/>
<script type="module" src="https://unpkg.com/@umich-lib/components@prerelease/dist/umich-lib/umich-lib.esm.js"></script>
<script nomodule src="https://unpkg.com/@umich-lib/components@prerelease/dist/umich-lib/umich-lib.js"></script>
```

## Status

Approved

## Consequences

We have a way to manage development contributions and use them in our development projects before production release commitments.

This adds some complexity for the developer using prereleases to swap between `@prerelease` and `@v1` tags, but this could be automated, perhaps.
