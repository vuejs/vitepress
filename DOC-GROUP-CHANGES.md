# Code Group Name Feature - Implementation Plan

## Overview

Add support for named code groups via the `group-name` parameter in the code-group container syntax. This allows developers to semantically identify and potentially sync code groups across a documentation site.

## Feature Specification

### Markdown Syntax

**Current:**
```markdown
::: code-group

```js [config.js]
// code
```

:::
```

**New:**
```markdown
::: code-group group-name=installs

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

:::
```

**Note:** Group names must not contain whitespace. Use hyphens, underscores, or camelCase instead.

### HTML Output

**Current:**
```html
<div class="vp-code-group">
  <div class="tabs">...</div>
  <div class="blocks">...</div>
</div>
```

**New:**
```html
<div class="vp-code-group" data-group-name="installs">
  <div class="tabs">...</div>
  <div class="blocks">...</div>
</div>
```

## Implementation Plan

### 1. Core Changes

#### File: `/src/node/markdown/plugins/containers.ts`

**Function:** `createCodeGroup()`

**Changes Required:**
- Parse the `token.info` string to extract `group-name=value` parameter
- Extract and validate the group name value
- Add `data-group-name` attribute to the opening `<div class="vp-code-group">` tag
- Handle edge cases:
  - Empty group name: `group-name=` → ignore
  - Whitespace in name: reject/ignore (group names must not contain whitespace)
  - Special characters: allow only alphanumeric, hyphens, underscores
  - Invalid syntax: gracefully ignore and render without attribute

**Implementation approach:**
```typescript
// Pseudo-code
function createCodeGroup(md: MarkdownItAsync): ContainerArgs {
  return [
    container,
    'code-group',
    {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          const token = tokens[idx]
          const info = token.info.trim()
          
          // Extract group-name parameter
          const groupNameMatch = info.match(/group-name=(\S+)/)
          let groupName = groupNameMatch ? groupNameMatch[1] : null
          
          // Validate: only allow alphanumeric, hyphens, and underscores
          if (groupName && !/^[a-zA-Z0-9_-]+$/.test(groupName)) {
            groupName = null // Invalid group name, ignore
          }
          
          // Build data attribute
          const groupNameAttr = groupName ? 
            ` data-group-name="${md.utils.escapeHtml(groupName)}"` : ''
          
          // ... existing tab generation logic ...
          
          return `<div class="vp-code-group"${groupNameAttr}><div class="tabs">${tabs}</div><div class="blocks">\n`
        }
        return `</div></div>\n`
      }
    }
  ]
}
```

### 2. Type Definitions

#### File: `/src/shared/shared.ts` or appropriate type definition file

**Changes Required:**
- No TypeScript interface changes needed (HTML data attributes are dynamic)
- Document the new attribute in JSDoc comments if applicable

### 3. Client-Side Changes (Optional for Future Enhancement)

#### File: `/src/client/app/composables/codeGroups.ts`

**Current scope:** No immediate changes required for basic implementation

**Future enhancement possibilities:**
- Sync tab selection across code groups with the same `group-name`
- Store selection preference in localStorage per group name
- Emit events for cross-component synchronization

### 4. Styling Changes

#### File: `/src/client/theme-default/styles/components/vp-code-group.css`

**Changes Required:**
- No CSS changes needed for basic implementation
- The `data-group-name` attribute is purely semantic for this iteration
- Could add attribute selectors for future styling: `[data-group-name="installs"]`

## Testing Strategy

### 1. Unit Tests

**File:** `/__tests__/unit/node/markdown-container.test.ts` (create if doesn't exist)

**Test cases:**
- ✅ Parse basic group-name parameter: `group-name=installs`
- ✅ Parse group-name with hyphens: `group-name=install-methods`
- ✅ Parse group-name with underscores: `group-name=install_methods`
- ✅ Parse group-name with camelCase: `group-name=installMethods`
- ✅ Handle missing group-name (no parameter)
- ✅ Handle empty group-name: `group-name=`
- ✅ Reject group-name with spaces: `group-name="install methods"` → ignore
- ✅ Reject group-name with invalid characters: `group-name=install@methods` → ignore
- ✅ Verify data attribute is properly added to HTML output
- ✅ Verify existing functionality not broken

### 2. E2E Tests

**File:** `/__tests__/e2e/markdown-extensions/markdown-extensions.test.ts`

**New test suite:**
```typescript
describe('Code Groups with Names', () => {
  test('basic group-name attribute', async () => {
    const div = page.locator('#group-name-basic + div')
    
    // Verify data attribute exists
    const groupName = await div.getAttribute('data-group-name')
    expect(groupName).toBe('installs')
    
    // Verify tabs still work
    const labels = div.locator('.tabs > label')
    expect(await labels.count()).toBe(2)
    
    // Verify clicking still switches tabs
    await labels.nth(1).click()
    const blocks = div.locator('.blocks > div')
    expect(await getClassList(blocks.nth(1))).toContain('active')
  })
  
  test('group-name with quotes', async () => {
    const div = page.locator('#group-name-quoted + div')
    const groupName = await div.getAttribute('data-group-name')
    // Quoted names with spaces should be rejected
    expect(groupName).toBeNull()
  })
  
  test('code-group without group-name', async () => {
    const div = page.locator('#basic-code-group + div')
    const groupName = await div.getAttribute('data-group-name')
    expect(groupName).toBeNull()
  })
  
  test('group-name with hyphens and underscores', async () => {
    const div = page.locator('#group-name-special + div')
    const groupName = await div.getAttribute('data-group-name')
    expect(groupName).toBe('install_methods-v2')
  })
  
  test('group-name with invalid characters', async () => {
    const div = page.locator('#group-name-invalid + div')
    const groupName = await div.getAttribute('data-group-name')
    // Should be rejected due to invalid characters
    expect(groupName).toBeNull()
  })
})
```

**Test fixtures:** `/__tests__/e2e/markdown-extensions/index.md`

Add new markdown sections:
```markdown
### Group Name Basic

::: code-group group-name=installs

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

:::

### Group Name Quoted (Should be Rejected)

::: code-group group-name="install methods"

```bash [npm]
npm install vitepress
```

```bash [yarn]
yarn add vitepress
```

:::

### Group Name with Hyphens and Underscores

::: code-group group-name=install_methods-v2

```bash [npm]
npm install vitepress@next
```

```bash [pnpm]
pnpm add vitepress@next
```

:::

### Group Name Invalid Characters (Should be Rejected)

::: code-group group-name=install@methods!

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

:::
```

### 3. Manual Testing Checklist

- [ ] Code group renders correctly in dev mode
- [ ] Code group renders correctly in build mode
- [ ] Tab switching works with group-name attribute
- [ ] Multiple code groups on same page work independently
- [ ] Code groups with same group-name attribute render correctly
- [ ] Group name with hyphens works
- [ ] Group name with underscores works
- [ ] Group name with spaces is rejected (no attribute added)
- [ ] Group name with invalid characters is rejected
- [ ] Code group without group-name still works (backward compatibility)
- [ ] Imported snippets work with group-name
- [ ] Hot module reload works in dev mode

## Documentation Updates

### 1. Main Documentation

**File:** `/docs/en/guide/markdown.md`

**Section:** Code Groups (around line 690)

**Addition:**

```markdown
### Named Code Groups

You can optionally name code groups using the `group-name` parameter. This can be useful for semantic identification and potential future features like syncing tab selections across groups.

**Input**

````md
::: code-group group-name=package-managers

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

```bash [yarn]
yarn add vitepress
```

:::
````

**Output**

::: code-group group-name=package-managers

```bash [npm]
npm install vitepress
```

```bash [pnpm]
pnpm add vitepress
```

```bash [yarn]
yarn add vitepress
```

:::

The `group-name` parameter accepts only alphanumeric characters, hyphens, and underscores. No whitespace is allowed.

Valid examples:
- `group-name=installs`
- `group-name=install-methods`
- `group-name=install_methods`
- `group-name=installMethods`

::: tip
Named code groups add a `data-group-name` attribute to the generated HTML, which can be useful for custom styling or scripting.
:::
```

### 2. API/Reference Documentation

**File:** `/docs/en/reference/default-theme-config.md` or appropriate reference doc

**If applicable:** Document the HTML structure and data attributes

### 3. Internationalization

Update the following language versions with translated content:
- `/docs/es/guide/markdown.md`
- `/docs/ja/guide/markdown.md`
- `/docs/ko/guide/markdown.md`
- `/docs/pt/guide/markdown.md`
- `/docs/ru/guide/markdown.md`
- `/docs/zh/guide/markdown.md`
- `/docs/fa/guide/markdown.md`

**Note:** Initial PR can focus on English docs, with i18n as follow-up PRs.

## Migration & Backward Compatibility

### Breaking Changes
**None.** This is a purely additive feature.

### Backward Compatibility
- All existing code groups without `group-name` parameter continue to work exactly as before
- The parameter is optional and doesn't change default behavior
- No configuration changes required

## Future Enhancements (Out of Scope for Initial PR)

1. **Tab Synchronization**
   - Sync tab selection across all code groups with the same `group-name`
   - Example: Selecting "npm" in one "package-managers" group auto-selects "npm" in all other "package-managers" groups

2. **LocalStorage Persistence**
   - Remember user's last selected tab per group-name
   - Restore selection on page load/navigation

3. **Custom Styling Hooks**
   - CSS variables for group-specific styling
   - Example: Different color schemes per group-name

4. **Programmatic API**
   - JavaScript API to control code group tab selection
   - Events for tab changes

## Implementation Timeline

1. **Phase 1:** Core implementation (containers.ts)
2. **Phase 2:** Testing (unit + e2e)
3. **Phase 3:** Documentation (English)
4. **Phase 4:** Code review and refinement
5. **Phase 5:** i18n documentation (can be separate PRs)

## Files to Modify

### Required Changes
- ✅ `/src/node/markdown/plugins/containers.ts` - Core logic
- ✅ `/__tests__/e2e/markdown-extensions/index.md` - Test fixtures
- ✅ `/__tests__/e2e/markdown-extensions/markdown-extensions.test.ts` - E2E tests
- ✅ `/docs/en/guide/markdown.md` - Documentation

### Optional/Future
- ⏭️ `/src/client/app/composables/codeGroups.ts` - Tab sync feature
- ⏭️ All i18n documentation files

## Success Criteria

- [ ] Group-name parameter is correctly parsed from markdown
- [ ] HTML output includes `data-group-name` attribute when specified
- [ ] All tests pass (existing + new)
- [ ] Documentation is clear and includes examples
- [ ] No regression in existing code group functionality
- [ ] Code follows VitePress contribution guidelines
- [ ] Commit messages follow convention

## Notes

- Keep the implementation simple and focused for the initial version
- Ensure proper HTML escaping to prevent XSS vulnerabilities
- Consider edge cases in parsing (quotes, special chars, etc.)
- Maintain consistency with existing VitePress container syntax patterns
