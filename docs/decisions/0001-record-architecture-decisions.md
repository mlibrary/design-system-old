# ADR 1. Record Architecture Decisions

March 3, 2021

This document is heavily based on [Michael Nygard's documenting architecture decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) article. The content below is a copy, but lightly edited for our record here.

## Context

One of the hardest things to track during the life of a project is the motivation behind certain decisions. A new person coming on to a project may be perplexed, baffled, delighted, or infuriated by some past decision.

Without understanding the rationale or consequences, this person has only two choices:

1. **Blindly accept the decision.**

   This response may be OK, if the decision is still valid. It may not be good, however, if the context has changed and the decision should really be revisited. If the project accumulates too many decisions accepted without understanding, then the development team becomes afraid to change anything and the project collapses under its own weight.

2. **Blindly change it.**

   Again, this may be OK if the decision needs to be reversed. On the other hand, changing the decision without understanding its motivation or consequences could mean damaging the project's overall value without realizing it. (E.g., the decision supported a non-functional requirement that hasn't been tested yet.)

It's better to avoid either blind acceptance or blind reversal.

## Decision

We will use Architecture Decision Records (ADRs) to record the decisions made for the Design System.

We will write each ADR with the following parts so each document is easy to digest:

**Title**—These documents have names that are short noun phrases. For example, "ADR 1: Deployment on Ruby on Rails 3.0.10" or "ADR 9: LDAP for Multitenant Integration"

**Context**—This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts.

**Decision**—This section describes our response to these forces. It is stated in full sentences, with active voice. "We will …"

**Status**—A decision may be "proposed" if the project stakeholders haven't agreed with it yet, or "accepted" once it is agreed. If a later ADR changes or reverses a decision, it may be marked as "deprecated" or "superseded" with a reference to its replacement.

**Consequences**—This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future.

## Status

Proposed

## Consequences

The Design System team adopts this into our workflow and begin the practice of writing ADRs.

People contributing will be able to find decisions over time and understood, and reevaluated with documented details by people contributing.
