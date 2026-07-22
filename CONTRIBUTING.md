# Contributing to Factory Inventory Management System

Thank you for your interest in contributing! This document provides guidelines and instructions for development.

## Getting Started

### Prerequisites
- Python 3.10+ (backend)
- Node.js 18+ (frontend)
- Git

### Setup Development Environment

**Backend:**
```bash
cd server
pip install -r requirements.txt
python main.py
# API runs on http://localhost:8001
```

**Frontend:**
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:3000
```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix-name
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Tests
- `refactor/` - Code refactoring

### 2. Make Your Changes

Follow the coding standards:
- **Backend**: See `server/CLAUDE.md`
- **Frontend**: See `client/CLAUDE.md`

### 3. Run Tests

**Backend Tests:**
```bash
python -m pytest tests/backend -v
```

**Frontend Tests:**
```bash
cd client
npm run test
```

**Code Quality Checks:**
```bash
# Format Python code
python -m black server/ tests/

# Check code quality
python -m pylint server/main.py
npx eslint client/src --fix
```

### 4. Commit Your Changes

```bash
git add <files>
git commit -m "Description of changes"
```

Commit message format:
```
Short description (50 characters max)

More detailed explanation if needed.
- Bullet points for multiple changes
- Include related issue numbers (#123)

Co-Authored-By: Your Name <email@example.com>
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Standards

### Python (Backend)

**Format with Black:**
```bash
python -m black server/ tests/ --line-length=100
```

**Configuration:** See `pyproject.toml`

**Style guide:**
- Use meaningful variable names
- Add docstrings to functions
- Keep functions focused and small
- Handle errors explicitly
- Use type hints where helpful

**Example:**
```python
from typing import Optional, List
from pydantic import BaseModel

class Order(BaseModel):
    id: str
    total_value: float
    status: str

def get_orders(
    warehouse: Optional[str] = None,
    category: Optional[str] = None
) -> List[Order]:
    """Get orders with optional filtering."""
    # Implementation
    return orders
```

### JavaScript/Vue (Frontend)

**Format with Prettier (via ESLint):**
```bash
npx eslint client/src --ext .js,.vue --fix
```

**Configuration:** See `client/.eslintrc.cjs`

**Style guide:**
- Use Vue 3 Composition API
- Use `const` instead of `let`
- Keep components focused
- Extract composables for shared logic
- Use scoped styles

**Example:**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<style scoped>
button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## Testing

### Writing Backend Tests

Use pytest with FastAPI TestClient:

```python
def test_get_inventory(client):
    """Test getting inventory items."""
    response = client.get("/api/inventory")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Validate structure
    item = data[0]
    assert "sku" in item
    assert "quantity_on_hand" in item
```

### Writing Frontend Tests

Use Vitest with Vue Test Utils:

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })

  it('updates data on user interaction', async () => {
    const wrapper = mount(MyComponent)
    const button = wrapper.find('button')
    
    await button.trigger('click')
    expect(wrapper.vm.count).toBe(1)
  })
})
```

### Test Coverage Goals
- Backend: 100% API endpoint coverage
- Frontend: 60%+ component coverage
- E2E: Critical user workflows

## Documentation

### Updating CLAUDE.md Files
When making significant changes, update the relevant CLAUDE.md:
- `server/CLAUDE.md` - Backend guidelines
- `client/CLAUDE.md` - Frontend guidelines

### Adding Comments
Add comments for:
- Non-obvious logic
- Why (not what) of implementation
- Complex algorithms
- Important invariants

Example:
```python
# Filter inventory to exclude items with zero reorder point
# (prevents infinite loops in optimization algorithm)
valid_items = [
    item for item in inventory 
    if item['reorder_point'] > 0
]
```

## Pull Request Process

1. **Before Creating PR:**
   - Run all tests locally
   - Format code with black/eslint
   - Verify no console errors
   - Update documentation if needed

2. **PR Requirements:**
   - Clear title describing the change
   - Detailed description of what and why
   - Link to related issues (#123)
   - Screenshots for UI changes

3. **Review Process:**
   - At least 1 approval required
   - All CI checks must pass
   - Code quality score >= 8.0/10
   - Tests must be included for new features

4. **After Approval:**
   - Squash commits if requested
   - Merge to main
   - Delete feature branch

## Common Tasks

### Adding a New API Endpoint

1. Define Pydantic model in `server/main.py`
2. Implement endpoint function
3. Add validation and error handling
4. Write tests in `tests/backend/`
5. Update API documentation
6. Test with http://localhost:8001/docs

Example:
```python
from pydantic import BaseModel

class MyRequest(BaseModel):
    name: str
    value: float

@app.post("/api/my-endpoint", response_model=dict)
def my_endpoint(request: MyRequest):
    """Handle my endpoint."""
    # Implementation
    return {"result": request.value * 2}
```

### Adding a New Vue Component

1. Create component in `client/src/components/`
2. Follow Vue 3 Composition API pattern
3. Use scoped styles
4. Add component tests in `*.spec.js`
5. Export in parent or router
6. Add to storybook if available

### Adding New Data to Mock Data

1. Update JSON file in `server/data/`
2. Update Pydantic model if schema changed
3. Ensure data consistency (SKUs, categories)
4. Restart server to reload
5. Verify with API tests

### Fixing a Bug

1. Create test that reproduces bug
2. Verify test fails
3. Implement fix
4. Verify test passes
5. Run full test suite
6. Document fix in commit message

## Performance Considerations

### Backend
- In-memory data is fast but limited to ~10K items
- All filtering happens in Python
- Consider database if scaling beyond 100K items

### Frontend
- Use computed properties instead of methods for caching
- Lazy-load large components
- Use v-show for frequently toggled elements
- Debounce expensive operations

## Security Notes

Current state (development only):
- No authentication
- CORS allows all origins
- No rate limiting

For production:
- Add authentication/authorization
- Restrict CORS origins
- Implement rate limiting
- Validate all input
- Use HTTPS only

## Getting Help

- Check existing documentation in CLAUDE.md files
- Look at similar code in the codebase
- Review test examples
- Ask in PR comments
- Create an issue for questions

## Reporting Bugs

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Error messages/logs
5. Browser/Python version
6. Screenshots if UI-related

## Feature Requests

When requesting features:
1. Clear description of use case
2. Proposed solution
3. Alternative approaches considered
4. Impact on existing features
5. Examples of similar features

## Code Review Checklist

Reviewers should verify:
- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No performance regressions
- [ ] Error handling is proper
- [ ] Security considerations addressed
- [ ] Backward compatibility maintained
- [ ] Comments are clear and necessary

## Release Process

1. Update version in package.json/pyproject.toml
2. Update CHANGELOG.md
3. Create release notes
4. Tag commit with version
5. Create GitHub release
6. Deploy to production

## Questions?

- Review CLAUDE.md files for detailed guidelines
- Check existing code for patterns
- Create a discussion in GitHub
- Open an issue for clarification

Thank you for contributing! 🙏
