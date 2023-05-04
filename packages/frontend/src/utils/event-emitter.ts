export interface IEvents {
  [key: string] : any
}

export interface IRegisteredEvents {
  [key: string]: string
}

declare type TCallback = (args: any) => void;

const events = {} as IEvents;

export const EventEmitter = {
  dispatch: (event: string, data: any) => {
    // console.info('dispatch', event, events[event])
    if (!events[event]) return;
    events[event].forEach((callback: TCallback) => callback(data));
  },
  subscribe: (event: string, callback: TCallback) => {
    if (!events[event]) events[event] = [];
    events[event].push(callback);

    return events[event].length - 1;
  },
  unsubscribe: (event: string, id: number) => {
    if (!events[event]) return;
    if (!events[event][id]) return;

    events[event] = events[event].filter((v: string, i: number) => i !== id);
  },
};

export const RegistryEvents: IRegisteredEvents = {
  filterUpdated: 'filterUpdated',
  pageUpdated: 'pageUpdated',
  sortUpdated: 'sortUpdated'
}
