import React, { FC } from 'react';
import { Admin as ReactAdmin, fetchUtils } from 'react-admin';
import { Resource } from '@react-admin/ra-rbac';
import restDataProvider from 'ra-data-rest-client';
import { AUTH_PROVIDER, BACKEND_URL } from '../config';
import authProvider from './authProvider';
import MyLoginPage from '../views/NewLogin';
import MyLayout from '../MyLayout';
import theme from '../Theme';
import Dashboard from '../Dashboard';
import BookIcon from '@material-ui/icons/Book';
import { LogoutButton } from '../LogoutButton';

import { UserCreate, UserEdit, UserList, UserShow } from './Users';
import {
  KingdomCreate,
  KingdomEdit,
  KingdomList,
  KingdomShow,
} from './Kingdoms';
import {
  ClassificationSystemCreate,
  ClassificationSystemEdit,
  ClassificationSystemList,
  ClassificationSystemShow,
} from './Classification_systems';
import { AuthorCreate, AuthorEdit, AuthorList, AuthorShow } from './Authors';
import {
  TaxonRankCreate,
  TaxonRankEdit,
  TaxonRankList,
  TaxonRankShow,
} from './Taxon_rank';
import {
  PublicationCreate,
  PublicationEdit,
  PublicationList,
  PublicationShow,
} from './Publication';
import {
  CitationCreate,
  CitationEdit,
  CitationList,
  CitationShow,
} from './Citations';
import {
  TaxonNameCreate,
  TaxonNameEdit,
  TaxonNameList,
  TaxonNameShow,
} from './Taxon_names';
import {
  InformalGroupCreate,
  InformalGroupEdit,
  InformalGroupList,
  InformalGroupShow,
} from './Informal_groups';
import {
  HierarchyCreate,
  HierarchyEdit,
  HierarchyList,
  HierarchyShow,
} from './Hierarchies';
import {
  CrossReferenceCreate,
  CrossReferenceEdit,
  CrossReferenceList,
  CrossReferenceShow,
} from './Cross_references';
import {
  VernacularCreate,
  VernacularEdit,
  VernacularList,
  VernacularShow,
} from './Vernaculars';
import { RolesShow } from './Roles/RolesShow';
import { RolesList } from './Roles/RolesList';
import { UserRoleList } from './User_Role/UserRoleList';
import { UserRoleShow } from './User_Role/UserRoleShow';
import {
  DataProvider,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  GetOneParams,
} from 'ra-core/lib/types';
import { InfragenericData } from './Taxon_names/TaxonTypes';

const httpClient = (url: any, options?: any) => {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options).catch((error: any) => {
    return new Promise(function (resolve, reject) {
      reject({ message: error.body.detail });
    });
  });
};

const dataProvider = restDataProvider(
  BACKEND_URL,
  {
    users: 'user_id',
    kingdoms: 'kingdom_id',
    classification_systems: 'classification_system_id',
    authors: 'author_id',
    taxon_ranks: 'taxon_rank_id',
    publications: 'publication_id',
    citations: 'citation_id',
    taxon_names: 'taxon_name_id',
    informal_groups: 'informal_group_id',
    hierarchies: 'hierarchy_id',
    'hierarchies/parents': 'taxon_name_id',
    cross_references: 'cross_reference_id',
    vernaculars: 'vernacular_id',
    user_roles: 'user_role_id',
    roles: 'role_id',
    taxon_names_infrageneric_names: 'taxon_name_id',
  },
  {},
  httpClient
);
interface CacheDataProviderProxyParams {
  dataProvider: DataProvider;
  duration?: number;
}

const myDataProvider: DataProvider = {
  ...dataProvider,
  getOne: (resource: string, params: GetOneParams) => {
    if (resource === 'taxon_names_infrageneric_names') {
      const url = `${BACKEND_URL}/${resource}/${params.id}`;
      return httpClient(url).then(({ json }: { json: [InfragenericData] }) => ({
        data: { id: params.id, infrageneric_names: json },
      }));
    }
    // For other resources, fallback to the default implementation
    return dataProvider.getOne(resource, params);
  },
};

// Add cacheing to requests as per https://marmelab.com/react-admin/doc/3.19/Caching.html#application-cache
const cacheDataProviderProxy = ({
  dataProvider,
  // 5 minutes
  duration = 5 * 60 * 1000,
}: CacheDataProviderProxyParams) =>
  new Proxy(dataProvider, {
    get:
      (target, name: string) =>
      (
        resource: string,
        params: GetListParams &
          GetOneParams &
          GetManyParams &
          GetManyReferenceParams
      ) => {
        if (typeof name === 'symbol') {
          return;
        }
        if (
          ['getOne', 'getMany', 'getList', 'getManyReference'].includes(name)
        ) {
          return dataProvider[name](resource, params).then((response: any) => {
            const validUntil = new Date();
            validUntil.setTime(validUntil.getTime() + duration);
            response.validUntil = validUntil;
            return response;
          });
        }
        return dataProvider[name](resource, params);
      },
  });
export const Admin: FC = () => {
  return (
    <ReactAdmin
      loginPage={AUTH_PROVIDER === 'auth2' ? false : MyLoginPage}
      dashboard={Dashboard}
      layout={MyLayout}
      theme={theme}
      authProvider={authProvider}
      dataProvider={cacheDataProviderProxy({ dataProvider: myDataProvider })}
      logoutButton={LogoutButton}
    >
      <Resource
        name="users"
        key="user_id"
        list={UserList}
        show={UserShow}
        edit={UserEdit}
        create={UserCreate}
      />
      <Resource
        name="kingdoms"
        list={KingdomList}
        show={KingdomShow}
        edit={KingdomEdit}
        create={KingdomCreate}
      />
      <Resource
        name="classification_systems"
        list={ClassificationSystemList}
        show={ClassificationSystemShow}
        edit={ClassificationSystemEdit}
        create={ClassificationSystemCreate}
      />
      <Resource
        name="authors"
        list={AuthorList}
        show={AuthorShow}
        edit={AuthorEdit}
        create={AuthorCreate}
      />
      <Resource
        name="taxon_ranks"
        list={TaxonRankList}
        show={TaxonRankShow}
        edit={TaxonRankEdit}
        create={TaxonRankCreate}
      />
      <Resource
        name="publications"
        list={PublicationList}
        show={PublicationShow}
        edit={PublicationEdit}
        create={PublicationCreate}
      />
      <Resource
        name="citations"
        list={CitationList}
        show={CitationShow}
        edit={CitationEdit}
        create={CitationCreate}
      />
      <Resource
        name="taxon_names"
        list={TaxonNameList}
        show={TaxonNameShow}
        edit={TaxonNameEdit}
        create={TaxonNameCreate}
        icon={BookIcon}
      />
      <Resource name="taxon_names_ancestors/Division" />
      <Resource name="taxon_names_ancestors/Phylum" />
      <Resource name="taxon_names_ancestors/Order" />
      <Resource name="taxon_names_ancestors/Class" />
      <Resource name="taxon_names_ancestors/Family" />
      <Resource name="taxon_names_ancestors/Genus" />
      <Resource name="taxon_names_ancestors/Subgenus" />
      <Resource name="taxon_names_ancestors/Species" />
      <Resource name="taxon_names_ancestors/Subspecies" />
      <Resource name="taxon_names_infrageneric_names" />
      <Resource
        name="informal_groups"
        list={InformalGroupList}
        show={InformalGroupShow}
        edit={InformalGroupEdit}
        create={InformalGroupCreate}
      />
      <Resource
        name="hierarchies"
        list={HierarchyList}
        show={HierarchyShow}
        edit={HierarchyEdit}
        create={HierarchyCreate}
      />
      <Resource
        name="hierarchies/parents"
        list={HierarchyList}
        show={HierarchyShow}
        edit={HierarchyEdit}
        create={HierarchyCreate}
      />
      <Resource
        name="cross_references"
        list={CrossReferenceList}
        show={CrossReferenceShow}
        edit={CrossReferenceEdit}
        create={CrossReferenceCreate}
      />
      <Resource
        name="vernaculars"
        list={VernacularList}
        show={VernacularShow}
        edit={VernacularEdit}
        create={VernacularCreate}
      />
      <Resource name="user_roles" show={UserRoleShow} list={UserRoleList} />
      <Resource name="roles" show={RolesShow} list={RolesList} />
    </ReactAdmin>
  );
};
