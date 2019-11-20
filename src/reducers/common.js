import { TOGGLE_SIDEBAR, REPEAT, JWK } from '../actions/index';

const initialState = {
  sidebarOpen: false,
  repeat: 0,
  jwk: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_SIDEBAR: {
      return { ...state, sidebarOpen: !state.sidebarOpen };
    }
    case REPEAT: {
      return { ...state, repeat: action.id };
    }
    case JWK: {
      return { ...state, jwk: action.jwk };
    }
    default: {
      return state;
    }
  }
};
