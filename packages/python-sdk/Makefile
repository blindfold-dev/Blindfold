.PHONY: help install test lint format clean build publish

help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make test        - Run tests"
	@echo "  make test-cov    - Run tests with coverage"
	@echo "  make lint        - Run linters"
	@echo "  make format      - Format code"
	@echo "  make type-check  - Run type checker"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make build       - Build package"
	@echo "  make validate    - Run all checks (lint, type, test)"

install:
	pip install -e ".[dev]"

test:
	pytest

test-cov:
	pytest --cov=blindfold --cov-report=html --cov-report=term

lint:
	ruff check src tests
	black --check src tests
	isort --check-only src tests

lint-fix:
	ruff check --fix src tests
	black src tests
	isort src tests

format:
	black src tests
	isort src tests

type-check:
	mypy src

clean:
	rm -rf dist build *.egg-info
	rm -rf .pytest_cache .mypy_cache .ruff_cache
	rm -rf htmlcov .coverage coverage.xml
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

build: clean
	python -m build

validate: lint test

publish: build
	python -m twine upload dist/*
