import { normalize, schema } from 'normalizr';
import { createContext, useContext, useEffect, useReducer } from 'react';

import { useConnection } from '../components/contexts/connection';

// Basic entities
const instrumentsEntity = new schema.Entity('instruments');
const structureEntity = new schema.Entity('structures');

// Nested entities
const measuresEntity = new schema.Entity('measures', {
  instruments: instrumentsEntity,
  structure: structureEntity
});
const analysisEntity = new schema.Entity('analyses', {
  measures: measuresEntity
});
const reportEntity = new schema.Entity('reports', {
  structure: structureEntity
});

const CATEGORY_ENTITIES_MAP = {
  analyses: [analysisEntity],
  instruments: [instrumentsEntity],
  measures: [measuresEntity],
  reports: [reportEntity],
  structures: [structureEntity]
}

function defineInitialState() {
  const categories = Object.keys(CATEGORY_ENTITIES_MAP);

  return categories.reduce(
    (state, category) =>
      Object.assign(state, { [category]: { items: [], itemsMap: {} } }),
    {}
  );
}


// Actions types
const CREATE_UPDATE_ITEMS = 1;
const DELETE_ITEM = 2;

function registryReducer(state, action) {
  switch (action.type) {
    case CREATE_UPDATE_ITEMS: {
      const { category } = action.meta;
      if (!(category in CATEGORY_ENTITIES_MAP)) {
        throw new Error(`Unknown registry category "${category}"`);
      }

      const denormalizedData = Array.isArray(action.payload) ? action.payload : [action.payload]
      const arrayEntity = CATEGORY_ENTITIES_MAP[category]
      const { entities } = normalize(denormalizedData, arrayEntity);
      const categories = Object.keys(entities);
      const updates = categories.reduce((all, cat) => {
        const itemsMap = { ...state[cat].itemsMap, ...entities[cat] };
        const items = Object.values(itemsMap);
        const update = { [cat]: { items, itemsMap } };

        return Object.assign(all, update);
      }, {});

      return { ...state, ...updates };
    }
    case DELETE_ITEM: {
      const { category } = action.meta;
      const { id } = action.payload;
      const data = state[category];

      const itemsMap = { ...data.itemsMap };
      delete itemsMap[id];

      const items = Object.values(itemsMap);

      return { ...state, [category]: { itemsMap, items } };
    }
    default:
      return state;
  }
}

const RegistryContext = createContext();

export function RegistryProvider({ children }) {
  const [state, dispatch] = useReducer(registryReducer, defineInitialState());
  const { setActions } = useConnection();

  function createUpdate({ meta, payload }) {
    dispatch({
      type: CREATE_UPDATE_ITEMS,
      meta,
      payload,
    });
  }

  function delete_({ meta, payload }) {
    dispatch({
      type: DELETE_ITEM,
      meta,
      payload,
    });
  }

  const actions = {
    create: createUpdate,
    createUpdate,
    delete: delete_,
    delete_,
    update: createUpdate,
  };

  useEffect(() => {
    setActions({ actions, subdomainName: 'registry' });
  }, []);

  return (
    <RegistryContext.Provider value={{ ...actions, ...state }}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry() {
  return useContext(RegistryContext);
}
