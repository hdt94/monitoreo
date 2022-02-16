import { normalize } from 'normalizr';

// Actions types
const CREATE_UPDATE_ITEMS = 1;
const DELETE_ITEM = 2;

export default class Subdomain {

  constructor({ categoriesEntitiesMap, subdomainName }) {
    /*\
      `categoriesEntitiesMap` expected to map categories with array of an entity:
        
      const categoriesEntitiesMap = {
        category: [entity]
      };
     */

    this.categoriesEntitiesMap = categoriesEntitiesMap;
    this.subdomainName = subdomainName;

    this.reduce = this.reduce.bind(this);
  }

  defineActions({ dispatch }) {
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

    return actions;
  }

  defineInitialState() {
    const categories = Object.keys(this.categoriesEntitiesMap);

    return categories.reduce(
      (state, category) =>
        Object.assign(state, { [category]: { entities: {}, items: [] } }),
      {}
    );
  }

  reduce(state, action) {
    switch (action.type) {
      case CREATE_UPDATE_ITEMS: {
        const { category } = action.meta;
        if (!(category in this.categoriesEntitiesMap)) {
          throw new Error(`Unknown category "${category}" in state subdomain "${this.subdomainName}"`);
        }

        const newItems = Array.isArray(action.payload)
          ? action.payload
          : [action.payload]
        const arrayEntity = this.categoriesEntitiesMap[category]
        const results = normalize(newItems, arrayEntity);

        const categories = Object.keys(results.entities);
        const updates = categories.reduce((all, cat) => {
          const currentEntities = state[cat].entities;
          const newEntities = results.entities[cat];

          const entities = { ...currentEntities, ...newEntities };
          const items = Object.values(entities);
          const update = { [cat]: { entities, items } };

          return Object.assign(all, update);
        }, {});

        return { ...state, ...updates };
      }
      case DELETE_ITEM: {
        const { category } = action.meta;
        const id = action.payload;
        const data = state[category];

        const entities = { ...data.entities };
        delete entities[id];

        const items = Object.values(entities);

        return { ...state, [category]: { entities, items } };
      }
      default:
        return state;
    }
  }
}
