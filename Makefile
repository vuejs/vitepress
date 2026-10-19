.PHONY: build deploy dev test

build:
	pnpm build

deploy:
	pnpm docs:build

dev:
	pnpm docs:dev

test:
	pnpm test:unit
