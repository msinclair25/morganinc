---
title: Hoplon Defense
status: wip
featured: true
order: 1
track: Product
stack: [AI, Workers, Privacy, Governance, Multi-model]
links:
  live: https://hoplondef.com
  repo:
summary: Company AI chat with privacy, governance, multi-model routing, and token compression. Still a work in progress; public login is not open yet.
---

## Context

Enterprise teams need AI chat that respects org policy, privacy, and cost. Not a free-for-all against public models.

## What I built

**Hoplon Defense** is a company AI chat layer with privacy controls, governance, multi-model routing, and gateway token compression.

### Features (v1)

- Streaming multi-model chat
- Conversation history
- Paste images and file upload (images plus PDF, TXT, MD, DOCX)
- Org policy allowlists, PII redaction on text, audit metadata
- Token compression on the gateway
- Cross-model context: switch models mid-chat and keep full history
- Org instructions: firm-wide playbook injected every turn (admin)
- User memory: durable facts and preferences across chats
- Long-thread summary: older turns compressed into a rolling summary

## Outcome

Still in progress. Landing site is up at [hoplondef.com](https://hoplondef.com). Public login is not open yet, and the GitHub repo is private for now.
