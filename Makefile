.PHONY: ui clean help lint format

# Start the UI development server
ui:
	cd ui && npm run dev

# Lint the python code
lint:
	uv run ruff check --fix

# Format the python code
format:
	uv run ruff format

# Clean caches and build artifacts
clean:
	# Clean Python cache files
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .ruff_cache -exec rm -rf {} +
	find . -type d -name .langgraph_api -exec rm -rf {} +
	find . -type d -name .DS_Store -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .coverage .coverage_report htmlcov assert
	cd ui && rm -rf dist node_modules/.vite
	rm -rf kura/static/dist/

# Show available targets
help:
	@echo "Available targets:"
	@echo "  ui    - Start the UI development server"
	@echo "  lint  - Lint the python code"
	@echo "  format - Format the python code"
	@echo "  clean - Clean caches and build artifacts"
	@echo "  help  - Show this help message"