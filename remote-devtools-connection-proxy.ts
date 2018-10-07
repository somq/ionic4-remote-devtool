import { ReduxDevtoolsExtensionConnection } from '@ngrx/store-devtools/src/extension';

export class RemoteDevToolsConnectionProxy implements ReduxDevtoolsExtensionConnection {
  constructor(public remotedev: any, public instanceId: string) {}
  init() {}
  error() {}

  subscribe(listener: (change: any) => void): any {
    const listenerWrapper = (change: any) => {
      console.log(`change: `, change);
      listener(change);
    };

    this.remotedev.subscribe(listenerWrapper);
    // Hack fix for commit/time-travelling etc. if the devtools are already open
    setTimeout(() => listenerWrapper({ type: 'START' }));
  }

  unsubscribe(): any {
    // HACK fix bug in @ngrx/store-devtools that calls this instead of returning
    // a lambda that calls it when their Observable wrapper is unsubscribed.
    return () => this.remotedev.unsubscribe(this.instanceId);
  }

  send(action: any, state: any): any {
    // Was commented has 'Not Called' but it's appear 
    // we finally need this to send back responses to Redux DevTools
    this.remotedev.send(action, state);
  }
}
