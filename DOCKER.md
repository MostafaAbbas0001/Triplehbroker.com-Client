# Client container

The client is built as a Node/Nitro SSR container. Browser requests use
`VITE_API_BASE_URL`; server-rendered requests use `API_INTERNAL_BASE_URL` to
reach the backend through Docker DNS.

Create the shared network once, copy the example values into `.env`, and start
the client:

```sh
docker network create tripleh-network
docker compose up -d --build
```

For production, set `VITE_SITE_URL` and `VITE_API_BASE_URL` to the public HTTPS
origins. Keep `API_INTERNAL_BASE_URL=http://tripleh-server:8080` while both
containers use the shared network.
