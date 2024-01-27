# Using Ngrok to share localhost endpoint

Add your **Ngrok** Authtoken:
```bash
ngrok config add-authtoken <your_authtoken>
```

Then you can run: 
```bash
ngrok http 3001
```

Ngrok its goint to provide you with a URL that you can set  
in the copilot app to call your webhook endpoint.
