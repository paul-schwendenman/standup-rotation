import { onMount } from "svelte";
import { writable } from "svelte/store";
import lzString from 'lz-string';
const {decompressFromEncodedURIComponent, compressToEncodedURIComponent} = lzString;

export function urlHash(defaultValue) {
  const { subscribe, set, update } = writable(defaultValue);

  function decode(base64) {
    return JSON.parse(decompressFromEncodedURIComponent(base64));
  }

  function encode(value) {
    return compressToEncodedURIComponent(JSON.stringify(value));
  }

  async function persistantSet(value) {
    location.hash = await encode(value);

    set(value);
  }

  function persistantUpdate(fn) {
    update((oldValue) => {
      const newValue = fn(oldValue);

      location.hash = encode(newValue);
    });
  }

  const base64 = location.hash.substring(1);

  if (base64.length > 0) {
    set(decode(base64));
  }

  return {
    set: persistantSet,
    update: persistantUpdate,
    subscribe,
  };
}

export function persistable(key, defaultValue) {
  let mounted = false;
  const { subscribe, set, update } = writable(defaultValue);

  const persistantSet = (value) => {
    set(value);

    if (mounted) {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    }
  };

  const persistantUpdate = (fn) => {
    update((oldValue) => {
      const value = fn(oldValue);

      if (mounted) {
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(key, jsonValue);
      }

      return value;
    });
  };

  onMount(() => {
    mounted = true;
    if (key in localStorage) {
      const value = JSON.parse(localStorage.getItem(key));

      set(value);
    }
  });

  return {
    set: persistantSet,
    update: persistantUpdate,
    subscribe,
  };
}
