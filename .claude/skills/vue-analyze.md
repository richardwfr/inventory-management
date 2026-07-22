# vue-analyze

Analyze Vue 3 components for performance and code reuse opportunities, generating a formatted report with specific findings and recommendations.

## Usage

```
/vue-analyze [path] [--save]
```

Examples:
- `/vue-analyze client/src/views/Orders.vue` - Analyze single file
- `/vue-analyze client/src/components/` - Analyze all components
- `/vue-analyze client/src --save` - Analyze and save report

## Implementation

When invoked, this skill:

1. **Discovers Vue files** using the target path/glob
2. **Reads each component** and analyzes structure
3. **Checks for patterns** based on Vue 3 best practices
4. **Generates structured report** with findings grouped by severity
5. **Saves report** to `vue-analysis-report.md` (optional)

### Analysis Checks

#### Performance (🔴 Critical / 🟡 Warning)
- **v-if vs v-show**: Flag v-if in frequently toggled containers
  - Look for: `v-if` near `@click`, `:class={...active}`, toggle patterns
  - Recommend: Use `v-show` for frequent visibility toggles
- **computed vs methods**: Methods that only return values without side effects
  - Look for: Methods with single return statement, no emit/API calls
  - Recommend: Convert to `computed()` for caching and reactivity
- **v-for keys**: Missing or insufficient keys
  - Look for: `v-for` without `:key` or `:key="index"`
  - Recommend: Always use unique ID like `:key="item.id"`
- **Watchers vs computed**: Deep watchers or watchers that derive values
  - Look for: `watch(ref, () => { ... })` with simple transformations
  - Recommend: Use `computed()` instead for better performance
- **Component size**: Components exceeding 200 lines
  - Recommend: Extract smaller components or composables

#### Code Reuse (🟢 Suggestion)
- **API patterns**: Repeated fetch/loading/error logic
  - Look for: Multiple `loading`, `error` refs with similar structure
  - Recommend: Extract `useApiCall()` or `useAsyncData()` composable
- **Filter logic**: Repeated filter/search patterns
  - Look for: Similar filter application in multiple components
  - Recommend: Create reusable `useFilters()` composable
- **Form state**: Repeated form handling patterns
  - Look for: Multiple `ref()` for form fields, validation
  - Recommend: Extract `useFormState()` composable
- **Date validation**: Date parsing without null checks
  - Look for: `.getMonth()`, `.getTime()` on potentially invalid dates
  - Recommend: Extract `useDateParser()` composable

#### Best Practices (🟡 Warning)
- **Prop mutation**: Direct assignment to props
  - Look for: `props.item = value` or `props.item.prop = value`
  - Recommend: Use `emit('update:item', newValue)` pattern
- **Inline calculations**: Complex logic in templates
  - Look for: Nested ternaries, method calls, formatting in `{{ }}`
  - Recommend: Move to `computed()` or method for clarity
- **Hardcoded values**: Magic numbers/strings in component
  - Look for: Repeated numbers, color codes, text
  - Recommend: Extract to constants or design tokens

## Report Structure

The generated report includes:

```markdown
# Vue Component Analysis Report

## Summary
- Files analyzed: N
- Total findings: N
- 🔴 Critical: N (must fix)
- 🟡 Warning: N (should fix)
- 🟢 Suggestion: N (consider)

## [Filename] - [Severity]

### Performance
🔴 Line N: [Issue]
   → [Recommendation]

### Code Reuse
🟢 Line N: [Extractable Pattern]
   → [Suggested composable/component]

### Best Practices
🟡 Line N: [Violation]
   → [How to fix]

## Metrics
- Average component size: X lines
- Extractable composables: X
- Code reuse potential: X%
- Next improvements: [Prioritized list]
```

## Output

- Prints formatted markdown report to console
- With `--save` flag, also writes to `vue-analysis-report.md`
- Include specific line numbers for IDE navigation
- Group findings by severity (Critical → Warning → Suggestion)
- Provide actionable recommendations with code patterns

## Integration

The analysis respects project patterns from `CLAUDE.md`:
- Vue 3 Composition API preferences
- Code standards and naming conventions
- Filter system patterns
- API integration patterns
- Component communication (props down, events up)
