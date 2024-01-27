dev:
	bun run dev

publish:
	ngrok http 3001

push:
	git add .
	git commit -m ${m}
