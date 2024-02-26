COPILOT_API=https://api-beta.copilot.com/v1

dev:
	bun run dev

push:
	git add .
	git commit -m "${m}"
	git push origin next

publish:
	ngrok http 3001

create-user:
	# export COPILOT_API_KEY=<API KEY>
	curl --request POST \
     --url "$(COPILOT_API)/clients?sendInvite=false" \
		 --header 'accept: application/json' \
		 --header 'content-type: application/json' \
		 --header "x-api-key: $(COPILOT_API_KEY)" \
		 --data-raw '{"givenName": "Jair", "familyName": "Anguiano", "email": "jairanpo@gmail.com"}' \
	| jq '.id' | tr -d '"' > "./temp/USER_ID"

delete-user:
	@USER_ID="$$(cat temp/USER_ID)"; \
	curl --request DELETE \
		--url "$(COPILOT_API)/clients/$$USER_ID" \
		--header 'accept: application/json' \
		--header "x-api-key: $(COPILOT_API_KEY)"



