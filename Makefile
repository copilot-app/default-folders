push:
	git add .
	git commit -m "${m}"
	git push origin next

publish:
	ngrok http 3001


