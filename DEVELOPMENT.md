# Development Guide

Quick start guide for developers working on the Factory Inventory Management System.

## 🚀 Quick Start

### Backend Setup

```bash
# Install dependencies
cd server
pip install -r requirements.txt

# Run the server
python main.py

# Server runs on http://localhost:8001
# API docs: http://localhost:8001/docs
```

### Frontend Setup

```bash
# Install dependencies
cd client
npm install

# Run dev server
npm run dev

# App runs on http://localhost:3000
```

## 🧪 Testing

### Run All Tests

```bash
# Backend tests (from project root)
python -m pytest tests/backend -v

# Frontend tests
cd client && npm run test
```

### Run Specific Tests

```bash
# Backend - specific file
python -m pytest tests/backend/test_inventory.py -v

# Backend - specific test
python -m pytest tests/backend/test_inventory.py::TestInventoryEndpoints::test_get_all_inventory -v

# Frontend - with UI
cd client && npm run test:ui

# Frontend - coverage
cd client && npm run test:coverage
```

## 🎨 Code Quality

### Format Code

```bash
# Python
python -m black server/ tests/

# JavaScript/Vue (auto-fix)
cd client && npx eslint src --ext .js,.vue --fix
```

### Check Code Quality

```bash
# Python formatting
python -m black --check server/ tests/

# Python linting
python -m pylint server/main.py

# JavaScript linting
cd client && npx eslint src --ext .js,.vue
```

### Setup Pre-Commit Hooks (Recommended)

```bash
# Install pre-commit
pip install pre-commit

# Setup hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## 📁 Project Structure

```
inventory-management/
├── server/                    # FastAPI backend
│   ├── main.py               # API endpoints
│   ├── mock_data.py          # Data loading
│   ├── generate_data.py      # Data generation
│   ├── requirements.txt       # Python dependencies
│   └── data/                 # Mock data files
│
├── client/                    # Vue 3 frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── views/            # Page components
│   │   ├── composables/      # Vue composables
│   │   ├── utils/            # Utility functions
│   │   └── locales/          # Translations (en, ja)
│   ├── package.json          # Dependencies
│   ├── vitest.config.js      # Test configuration
│   └── .eslintrc.cjs         # Linting configuration
│
├── tests/                     # Backend tests
│   └── backend/
│       ├── conftest.py       # Test fixtures
│       └── test_*.py         # Test files
│
├── pyproject.toml            # Python tool configuration
├── CONTRIBUTING.md           # Contribution guidelines
├── TESTING_SETUP.md          # Testing infrastructure
├── TEST_REPORT.md            # Test analysis
└── CHANGELOG.md              # Release notes
```

## 🔨 Common Tasks

### Add a Backend Endpoint

1. Define Pydantic model
2. Create endpoint function
3. Add to `server/main.py`
4. Write tests in `tests/backend/`
5. Verify with API docs

Example:
```python
from pydantic import BaseModel

class MyRequest(BaseModel):
    name: str
    value: float

@app.get("/api/my-endpoint")
def my_endpoint(name: str, value: float):
    """Handle request."""
    return {"result": value * 2}
```

### Add a Frontend Component

1. Create `.vue` file in `client/src/components/`
2. Use Vue 3 Composition API
3. Add tests in `*.spec.js`
4. Add to parent component or router

### Update Mock Data

1. Edit JSON file in `server/data/`
2. Update Pydantic model if needed
3. Restart server
4. Verify with tests

### Add Localization

1. Add keys to `client/src/locales/en.js`
2. Add translation to `client/src/locales/ja.js`
3. Use in template: `{{ t('key.name') }}`

## 🐛 Debugging

### Backend

```python
# Add temporary debug code
import pdb
pdb.set_trace()

# Or use print (visible in terminal)
print(f"Debug: {variable}")
```

Check server logs in terminal where `python main.py` is running.

### Frontend

Use Vue DevTools browser extension:
- Chrome: [Vue DevTools](https://chrome.google.com/webstore/detail/vuejs-devtools/)
- Firefox: [Vue DevTools](https://addons.mozilla.org/en-US/firefox/addon/vue-devtools/)

Browser console (F12):
```javascript
// In console, access Vue app
console.log(window.__APP__)
```

## 📝 Commit Message Format

```
Short description (50 chars max)

More detailed explanation if needed.
- Bullet points for multiple changes
- Reference issue numbers (#123)

Co-Authored-By: Your Name <email@example.com>
```

## 🔄 Pull Request Process

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and test locally
3. Format code: `black`, `eslint --fix`
4. Run tests: `pytest`, `npm run test`
5. Commit: `git commit`
6. Push: `git push origin feature/name`
7. Create PR on GitHub
8. Address review comments
9. Merge when approved

## 🚦 Before Merging

- [ ] All tests passing
- [ ] Code formatted (black, eslint)
- [ ] No console errors/warnings
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] One approval from maintainer

## 📚 Useful Documentation

- **Backend**: [server/CLAUDE.md](server/CLAUDE.md)
- **Frontend**: [client/CLAUDE.md](client/CLAUDE.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Testing**: [TESTING_SETUP.md](TESTING_SETUP.md)
- **Test Analysis**: [TEST_REPORT.md](TEST_REPORT.md)

## 🆘 Getting Help

1. Check existing code and tests for patterns
2. Review CLAUDE.md files for guidelines
3. Look at similar implementations
4. Create a discussion in PR/issue
5. Ask questions in comments

## 🎯 Development Goals

- Backend: Maintain 100% test coverage for API endpoints
- Frontend: Expand test coverage to 60%+
- Code Quality: Keep pylint score >= 8.0/10
- Performance: Test execution under 1 second

## ⚠️ Important Notes

- Don't commit `package-lock.json` changes unless intentional
- Keep `.env` files out of git
- Test changes before pushing
- Update documentation with code changes
- Follow existing code patterns

## 🔐 Security in Development

Current development setup:
- No authentication needed (demo only)
- CORS allows all origins
- No rate limiting

For production consideration:
- Add authentication/authorization
- Restrict CORS
- Implement rate limiting
- Validate all input
- Use HTTPS

---

**Happy coding! 🚀**

Need help? Check CONTRIBUTING.md or create an issue!
