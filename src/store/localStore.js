import * as LocalForage from 'localforage';

export const saveState = (state) => {
  console.log(state);
  LocalForage.setItem('state', state);
};

export const getState = () => LocalForage.getItem('state').then((state) => {
  if (state === null) {
    return undefined;
  }
  //return state;
  return undefined;
});

