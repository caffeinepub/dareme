# DareMe

## Current State
Difficulty is auto-assigned by round progress via `getLevelForRound()`. Players have no control over which difficulty level they get. There is no per-player difficulty tracking. The setup screen has no difficulty configuration.

## Requested Changes (Diff)

### Add
- New `difficulty` app phase inserted between `result` and `categories`
- Difficulty picker screen showing 3 buttons: Easy 😄, Medium 😎, Extreme 😈
- `selectedDifficulty` state (player's choice) replaces auto-computed `currentLevel`
- Per-player difficulty usage tracking: `playerDifficultyUsage: Record<playerIndex, { easy: number, medium: number, extreme: number }>`
- Per-difficulty limits per player across all rounds:
  - Easy: max `Math.ceil(totalRounds * 0.5)` times
  - Medium: max `Math.ceil(totalRounds * 0.4)` times  
  - Extreme: max `Math.ceil(totalRounds * 0.3)` times (also still requires extremeUnlocked)
- When a difficulty is at its limit for the current player, the button is greyed out and disabled with a "Used X/X" label
- Extreme button shows lock icon and paywall if not unlocked

### Modify
- Remove auto-level computation from `handleCategorySelect` and `getLevelForRound` usage in content flow
- Use player's `selectedDifficulty` instead of computed level when calling `getPool`
- Reset `playerDifficultyUsage` when a new game starts
- The existing difficulty badge on the wheel screen can be removed or show last used difficulty

### Remove
- Auto-assignment of difficulty based on round number in the player flow
- `currentLevel` derived from round number (replaced by `selectedDifficulty`)

## Implementation Plan
1. Add `difficulty` to AppPhase union type
2. Add `selectedDifficulty` state (DifficultyLevel | null)
3. Add `playerDifficultyUsage` state: array of objects tracking easy/medium/extreme count per player
4. Initialize/reset `playerDifficultyUsage` in game start handler
5. After `result` phase (when player taps continue), transition to `difficulty` phase instead of `categories`
6. Build DifficultyPicker screen component/section with 3 buttons, showing usage count vs limit
7. On difficulty select: set `selectedDifficulty`, increment usage counter for that player+difficulty, check extreme paywall, then go to `categories`
8. Pass `selectedDifficulty` to `getPool` instead of computed level
9. On round end/next player reset `selectedDifficulty` to null
