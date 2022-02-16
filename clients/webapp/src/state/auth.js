
import * as auth from 'services/auth';


const { NODE_ENV, REACT_APP_DEMO_USER } = process.env;
const demo = NODE_ENV !== "production" && REACT_APP_DEMO_USER === "true";

export const initState = demo ? ({
  accessToken: 'default',
  isAuthenticated: true,
  userId: "demo_user_id",
  userName: 'Demo user',
}) : ({
  accessToken: 'default',
  isAuthenticated: false,
  userId: null,
  userName: '',
});


// Unique action type
const UPDATE_USER = 1;


function userNameFromPayload(payload) {
  const { displayName, email } = payload;

  if (Boolean(displayName)) {
    return displayName;
  }

  const results = /.*@/.exec(email)
  if (results) {
    return results[0];
  }

  return 'Anonymous'
}

export function authReducer(state, action) {
  switch (action.type) {
    case UPDATE_USER: {
      if (!action.payload) {
        return initState;
      }

      const { accessToken = '', uid } = action.payload;

      return {
        ...state,
        accessToken,
        isAuthenticated: true,
        userName: userNameFromPayload(action.payload),
        userId: uid,
      };
    }
    default:
      return state;
  }
}

export function defineActions(dispatch) {
  function updateUser(payload) {
    dispatch({
      type: UPDATE_USER,
      payload,
    });
  }

  return {
    async authWithGoogle() {
      const response = await auth.authWithGoogle();

      return response;
    },
    async createAccount({ email, pass }) {
      const user = await auth.createAccount(email, pass);

      updateUser(user);
    },
    async login({ email, pass }) {
      const response = await auth.login({ email, pass });

      return response;
    },
    async logout() {
      await auth.logout();
    },
    updateUser
  }
}

export function setupAuthSubscription({ actions, onError }) {
  const callback = (payload) => {
    if (payload?.errors) {
      payload.errors.forEach(onError);
      return;
    }

    actions.updateUser(payload);
  };

  const unsubscribe = auth.setupAuthSubscription({ callback });

  return unsubscribe
}
