# @mykks32/expense-crux-contracts

Shared TypeScript interfaces for [expense.crux](https://github.com/mykks32/expense.crux) — the single source of truth for wire types consumed by both the NestJS backend and the mobile app, so they can't drift out of sync.

Pure interfaces only: no runtime code, no classes with behavior.

## Install

```bash
npm install @mykks32/expense-crux-contracts
```

This package is published to GitHub Packages, so npm/pnpm needs to be configured to resolve the `@mykks32` scope there — see the [root README](https://github.com/mykks32/expense.crux#readme).

## What's exported

- **`user.ts`** — `User`
- **`expense.ts`** — `Expense`, `CreateExpenseInput`, `UpdateExpenseInput`, `ListExpensesQuery`, `EXPENSE_SORT_FIELDS`, `ExpenseSortField`, `SORT_ORDERS`, `SortOrder`
- **`auth.ts`** — `RegisterInput`, `LoginInput`, `RefreshTokenInput`, `AuthResponse`
- **`api-response.ts`** — `ApiResponse<T>`, `PaginationMeta`, `PaginationLinks`

## Usage

Backend DTOs/serializers `implement` these interfaces for compile-time contract checking; the mobile app imports them directly for API request/response typing.

```ts
import type { Expense, ApiResponse } from '@mykks32/expense-crux-contracts';
```
