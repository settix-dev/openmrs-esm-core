import React from "react";
import createStore, { Store } from "unistore";

interface StoreEntity {
  value: Store<any>;
  active: boolean;
}

export type MockedStore<T> = Store<T> & { resetMock: () => void };

const initialStates: Record<string, any> = {};

const availableStores: Record<string, StoreEntity> = {};

export const mockStores = availableStores;

export function createGlobalStore<TState>(
  name: string,
  initialState: TState
): Store<TState> {
  const available = availableStores[name];

  if (available) {
    if (available.active) {
      console.error(
        "Cannot override an existing store. Make sure that stores are only created once."
      );
    } else {
      available.value.setState(initialState, true);
    }

    available.active = true;
    return available.value;
  } else {
    const store = createStore(initialState);
    initialStates[name] = initialState;

    availableStores[name] = {
      value: store,
      active: true,
    };

    return instrumentedStore(name, store);
  }
}

export function getGlobalStore<TState = any>(
  name: string,
  fallbackState?: TState
): Store<TState> {
  const available = availableStores[name];

  if (!available) {
    const store = createStore(fallbackState);
    initialStates[name] = fallbackState;
    availableStores[name] = {
      value: store,
      active: false,
    };
    return instrumentedStore(name, store);
  }

  return instrumentedStore(name, available.value);
}

function instrumentedStore<T>(name: string, store: Store<T>) {
  return ({
    getState: jest.spyOn(store, "getState"),
    setState: jest.spyOn(store, "setState"),
    subscribe: jest.spyOn(store, "subscribe"),
    unsubscribe: jest.spyOn(store, "unsubscribe"),
    resetMock: () => store.setState(initialStates[name]),
  } as any) as MockedStore<T>;
}

export const configInternalStore = createGlobalStore("config-internal", {
  devDefaultsAreOn: false,
});

export const implementerToolsConfigStore = createGlobalStore(
  "implementer-tools-config",
  {}
);

export const temporaryConfigStore = createGlobalStore("temporary-config", {});

export enum Type {
  Array = "Array",
  Boolean = "Boolean",
  ConceptUuid = "ConceptUuid",
  Number = "Number",
  Object = "Object",
  String = "String",
  UUID = "UUID",
}

export function openmrsFetch() {
  return new Promise(() => {});
}

export const setIsUIEditorEnabled = (boolean): void => {};

let state = { slots: {}, extensions: {} };

export const extensionStore = {
  getState: () => state,
  setState: (val) => {
    state = { ...state, ...val };
  },
  subscribe: (updateFcn) => {
    updateFcn(state);
    return () => {};
  },
  unsubscribe: () => {},
};

export const ComponentContext = React.createContext(null);

export const openmrsComponentDecorator = jest
  .fn()
  .mockImplementation(() => (component) => component);

export const UserHasAccess = jest.fn().mockImplementation((props: any) => {
  return props.children;
});

export const createUseStore = (store: Store<any>) => (actions) => {
  const state = store.getState();
  return { ...state, ...actions };
};

export const useExtensionStore = (actions) => {
  const state = extensionStore.getState();
  return { ...state, ...actions };
};

export const useStore = (store: Store<any>, actions) => {
  const state = store.getState();
  return { ...state, ...actions };
};

export const showToast = jest.fn();
