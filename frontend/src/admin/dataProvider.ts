import { BACKEND_URL } from '../config';
import {fetchUtils} from "react-admin";

const httpClient = (url: any, options: any) => {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
};

const id_convert = (resource) => {

};


const dataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
    };
    const url = `${BACKEND_URL}/${resource}?${JSON.stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json.map(resource => ({ ...resource, id: resource.kingdom_id }) ),
      total: parseInt(headers.get('content-range').split('/').pop(), 10),
    }));
  },
  getOne: (resource, params) => {
    // console.log(params);
    httpClient(`${BACKEND_URL}/${resource}/${params.id}`).then(({json}) => ({
      ...json, id: resource.kingdom_id,
    }));
  },
  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${BACKEND_URL}/${resource}?${JSON.stringify(query)}`;
    return httpClient(url).then(({ json }) => ({
      data: json.map(resource => ({ ...resource, id: resource.kingdom_id }) ),
    }));
  },

    getManyReference: (resource, params) => {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const query = {
    sort: JSON.stringify([field, order]),
    range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
    filter: JSON.stringify({
      ...params.filter,
      [params.target]: params.id,
    }),
  };
  const url = `${BACKEND_URL}/${resource}?${JSON.stringify(query)}`;

  return httpClient(url).then(({ headers, json }) => ({
    data: json.map(resource => ({ ...resource, id: resource.kingdom_id }) ),
    total: parseInt(headers.get('content-range').split('/').pop(), 10),
  }));
},

    update: (resource, params) =>
    httpClient(`${BACKEND_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
 ...json, id: json.kingdom_id ,
})),

updateMany: (resource, params) => {
  const query = {
    filter: JSON.stringify({ id: params.ids}),
  };
  return httpClient(`${BACKEND_URL}/${resource}?${JSON.stringify(query)}`, {
    method: 'PUT',
    body: JSON.stringify(params.data),
  }).then(({ json }) => ({ data: json }));
},

create: (resource, params) =>
    httpClient(`${BACKEND_URL}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.kingdom_id },
    })),

    delete: (resource, params) =>
    httpClient(`${BACKEND_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
    }).then(({ json }) => ({
 ...json, id: json.kingdom_id ,
})),

deleteMany: (resource, params) => {
  const query = {
    filter: JSON.stringify({ id: params.ids}),
  };
  return httpClient(`${BACKEND_URL}/${resource}?${JSON.stringify(query)}`, {
    method: 'DELETE',
    body: JSON.stringify(params.data),
  }).then(({ json }) => ({ data: json }));
}
};

export default dataProvider;