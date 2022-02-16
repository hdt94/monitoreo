# Monitoreo - webapp

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Up and running

### Development

General environment for local development:
```bash
export PORT=5000
export PROXY=http://localhost:8080
```
> Note: change values as needed.

Environment to work with demo user (i.e. no auth):
```bash
export REACT_APP_DEMO_USER=true
```

Environment to work with Cloud Identity:
```bash
export REACT_APP_IDENTITY_API_KEY=
export REACT_APP_IDENTITY_AUTH_DOMAIN=
```

Local development server:
```
npm start
```

Prototyping with `json-server` using `/api/host` prefix if using Vagrant or `/api/json` prefix if using Docker-Compose:
```bash
npm run dev
```

#### Debugging
> Notes:
> - Debugging with VSCode requires to launch app directly through a browser. So, it's not possible debugging if it's running within development virtual machine with Vagrant + VirtualBox
> - more info in [VSCode docs](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)

Debugging with the directory containing this document as VSCode workspace:
```bash
mkdir -p .vscode
cat << EOF > .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-msedge",
            "request": "launch",
            "name": "webapp: Edge against localhost",
            "url": "http://localhost:${PORT}",
            "webRoot": "\${workspaceFolder}"
        }
    ]
}
EOF
```

Debugging with `MONITOREO_ROOT` directory as VSCode workspace:
```bash
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-msedge",
            "request": "launch",
            "name": "webapp: Edge against localhost",
            "url": "http://localhost:${PORT}",
            "webRoot": "\${workspaceFolder}/clients/webapp"
        }
    ]
}
```

### Building

```bash
export REACT_APP_IDENTITY_API_KEY=
export REACT_APP_IDENTITY_AUTH_DOMAIN=
npm run build
```

### Prototyping (Nginx server)

Build and run container image directly with Docker daemon:
```bash
IMAGE_TAG=
docker build \
    -f Dockerfile.prot \
    -t $IMAGE_TAG \
    --build-arg REACT_APP_IDENTITY_API_KEY= \
    --build-arg REACT_APP_IDENTITY_AUTH_DOMAIN= \
    .
docker run -p 3000:80 $IMAGE_TAG

docker build \
    -f Dockerfile.prot \
    -t $IMAGE_TAG \
    --build-arg REACT_APP_IDENTITY_API_KEY=this-is-my-key \
    --build-arg REACT_APP_IDENTITY_AUTH_DOMAIN=this-is-my-auth-domain \
    .
```

Build and run container image with Docker-Compose:
```bash
export REACT_APP_IDENTITY_API_KEY=
export REACT_APP_IDENTITY_AUTH_DOMAIN=
docker-compose build
docker-compose run
```

## Notes

### State management

`subdomain` is an abstraction that groups categories of related entities to make easier the state management of CRUD resources from requests and live updates.

`context` is the value of a React Context that contains the categories of entities from a subdomain and the actions to create, update or delete those entities within context state. So, one context maps to one subdomain.

Regarding new subdomains:
- Create subdomains such as [state/analytics](./src/state/analytics.js).
- Add state providers to [App component](./src/App.jsx) such as [contexts/analytics](./src/components/contexts/analytics.jsx) or [contexts/registry](./src/components/contexts/registry.jsx).

TODO describe better
Regarding services, state actions, and live socket connection:
- Components use services for request-response.
- Services will use connection for request-response operations through live socket connection. Any operation can be called through HTTP directly if needed, such as attaching files to not saturate live socket connection.
- Components explicitly call state actions derived from request-response by current user, this ensures components has control over operations.
- Components subscribe/unsubscribe to rooms for receiving messages from server through live socket connection.
- Providers components assigns default actions to connection interface to process messages from subscriptions by setting actions available for a state context that will be called automatically, such as "delete" or "update" an entity triggered by other than current user.
    See function `setContextActions` in `ConnectionProvider` 

### Routes

- Modify any route in [`routes.jsx`](./src/components/routes.jsx)
- `NavMenu` currently lists all routes at `/analytics` and `/registry`

## TODO

Refactor all related to registry:
- [forms/registry](./src/components/forms/registry/)
- [services/registry](./src/services/registry.js)
- [state/registry](./src/state/registry.js)
