# Redux DevTool with a ionic v4 app

## how does it work?

The ionic app runs on the device, we proxy `ReduxDevtoolsExtension` to our server, and we connect Redux DevTools to our server.


## How to setup Redux-DevTools to connect remotely to a ionic v4 app running on device

### The client (app running on the phone)

We need to override `ReduxDevtoolsExtension` module connection to make it connect to our server and *proxy* sends and *receives*

```sh
mkdir MY_APP/devtool-hack
cp ngrx-devtool-hack.ts MY_APP/devtool-hack
cp remote-devtools-connection-proxy.ts MY_APP/devtool-hack
```

add this in app.module.ts to override RemoteDevToolsProxy

```ts
import { RemoteDevToolsProxy } from '../dev/ngrx-devtool-hack';

// Register our remote devtools if we're on-device and not in a browser
if (!window['devToolsExtension'] && !window['__REDUX_DEVTOOLS_EXTENSION__']) {
  const remoteDevToolsProxy = new RemoteDevToolsProxy({
    connectTimeout: 300000, // extend for pauses during debugging
    ackTimeout: 120000, // extend for pauses during debugging
    secure: false // dev only
  });

  // support both the legacy and new keys, for now
  window['devToolsExtension'] = remoteDevToolsProxy;
  window['__REDUX_DEVTOOLS_EXTENSION__'] = remoteDevToolsProxy;
  console.log(`window: `, window);
}

```

### The server (proxy)

> Note: uws does not compile properly on windows, to avoid using a vm we just use a forked version of remotedev-server allwoing us to pass `--wsEngine=ws`
> A PR has been opened on the remotedev-server rep, in the meanwhile we do this using a local repo


run the server

```sh
git clone https://github.com/somq/remotedev-server.git && cd remotedev-server && npm i && node bin\remotedev.js --hostname=CHANGE_ME_BY_YOUR_MACHINE_IP --port=8000 --wsEngine=ws --logLevel=3
```

### Redux DevTool

- Launch a DevTool instance
- Go to settings
- Tick Use custom (local) server
  - set Host name to YOUR_MACHINE_IP
  - set Port to 8000


### Troubleshoot

socketcluster-client might complains that `global is undefined`

It's because, by default, angular 6 [does not load pollyfills anymore](https://github.com/angular/angular-cli/issues/9827#issuecomment-369578814).
Either load intl polyfill or simply add `window.global = window` on top of `node_modules/socketcluster-client/lib/sctransport.js`

> Note: this is an ugly solution but I don't want to spend any more time on this one. Feel free to add a PR if you find a clean way to do this.
> socketcluster-client issue: https://github.com/SocketCluster/socketcluster-client/issues/118 