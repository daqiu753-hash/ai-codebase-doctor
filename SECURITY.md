# Security Policy

`ai-codebase-doctor` is a read-only scanner. It should not modify target repositories, execute target scripts, or send code to LLM APIs.

## Supported Versions

Security fixes target the latest public release.

## Reporting a Vulnerability

Please report security issues through GitHub issues only if the report does not include secrets or private code. For sensitive reports, contact the maintainer privately before sharing details publicly.

Do not include real API keys, tokens, private repository contents, or production `.env` files in reports.

## Non-goals

This project is not a secret scanner, malware scanner, dependency vulnerability scanner, or sandbox. Use specialized tools for those jobs.
