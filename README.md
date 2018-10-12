# How to use Redux DevTool with a ionic v4 app on device

> Note:   
> This explanation below explains everything using ngrx as exampe but it works exactly the same way with ngxs.  
> The only difference is the interface to implement (`NgxsDevtoolsExtension` instead of `ReduxDevtoolsExtensionConnection `)   
> You can find ngxs template files in the repo.
## how does it work?

The ionic app runs on the device, we proxy `ReduxDevtoolsExtension` to our server, and we connect `Redux DevTools` to our server.

```
(1) ionic on-device app  <--> (2) ws server <--> (3) Redux DevTools
```

## How to setup Redux-DevTools to connect remotely to a ionic v4 app running on device

### 1) The client (app running on the phone)

We need to override `ReduxDevtoolsExtension` module connection to make it connect to our server and *proxy* sends and *receives*

Copy the file containing classes implementing `ReduxDevtoolsExtension` to your appp

```sh
mkdir MY_APP/devtool-hack
cp ngrx-devtool-hack.ts MY_APP/devtool-hack
cp remote-devtools-connection-proxy.ts MY_APP/devtool-hack
```
Install [remotedev](https://github.com/zalmoxisus/remotedev) lib

```sh
npm install --save-dev remotedev
```

Add this in app.module.ts to override `ReduxDevtoolsExtension` RemoteDevToolsProxy class

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

### 2) The server (proxy)

> Note: uws does not compile properly on windows (and is deprecated), to avoid using a vm we just use a forked version of remotedev-server allowing us to pass `--wsEngine=ws`
> A [PR has been opened](https://github.com/zalmoxisus/remotedev-server/pull/63) on the remotedev-server repo, in the meanwhile it's accepted, we are using a local repo.


#### Run the server

```sh
git clone https://github.com/somq/remotedev-server.git && cd remotedev-server && npm i && node bin\remotedev.js --hostname=CHANGE_ME_BY_YOUR_MACHINE_IP --port=8000 --wsEngine=ws --logLevel=3
```

### 3) Redux DevTool

- Launch a **Redux DevTool** instance
- Go to *settings*
- Tick *Use custom (local) server*
  - set *Host name* to YOUR_MACHINE_IP
  - set *Port* to 8000


### Troubleshoot

socketcluster-client might complains that `global is undefined`

It's because, by default, angular 6 [does not load pollyfills anymore](https://github.com/angular/angular-cli/issues/9827#issuecomment-369578814).
Either load polyfills or simply add the [script](https://github.com/aws-amplify/amplify-js/issues/678#issuecomment-384260863) below to your index.html 


```html
<!-- angular 6+ global is undefined fix: -->
<script>
  if (global === undefined) {
    var global = window;
  }
</script>
<!-- angular 6+ global is undefined fix end-->
```


> Note: this is an ugly solution but I don't want to spend any more time on this one. Feel free to add a PR if you find a clean way to do this.
> socketcluster-client issue: https://github.com/SocketCluster/socketcluster-client/issues/118 


### Credits

Credits goes to [@zbarbuto](https://medium.com/@zbarbuto) and initially to [rob3c](https://gist.github.com/rob3c)


A good read:
https://medium.com/nextfaze/remote-debugging-ngrx-store-with-ionic-74e367316193
