import React, { FC } from 'react';
import { fetchUtils, Admin as ReactAdmin, Resource } from 'react-admin';
import restDataProvider from 'ra-data-rest-client';
import { BACKEND_URL } from '../config';
import authProvider from './authProvider';
import MyLoginPage from '../views/NewLogin';
import MyLayout from '../MyLayout';
import Dashboard from '../Dashboard';
import BookIcon from '@material-ui/icons/Book';
import role from './role';

import { UserList, UserShow, UserEdit, UserCreate } from './Users';
import {
  KingdomList,
  KingdomShow,
  KingdomEdit,
  KingdomCreate,
} from './Kingdoms';
import {
  ClassificationSystemCreate,
  ClassificationSystemShow,
  ClassificationSystemEdit,
  ClassificationSystemList,
} from './Classification_systems';
import { AuthorCreate, AuthorShow, AuthorEdit, AuthorList } from './Authors';
import {
  TaxonRankCreate,
  TaxonRankShow,
  TaxonRankEdit,
  TaxonRankList,
} from './Taxon_rank';
import {
  PublicationCreate,
  PublicationShow,
  PublicationEdit,
  PublicationList,
} from './Publication';
import {
  CitationCreate,
  CitationShow,
  CitationEdit,
  CitationList,
} from './Citations';
import {
  TaxonNameCreate,
  TaxonNameShow,
  TaxonNameEdit,
  TaxonNameList,
} from './Taxon_names';
import {
  InformalGroupCreate,
  InformalGroupShow,
  InformalGroupEdit,
  InformalGroupList,
} from './Informal_groups';
import {
  HierarchyCreate,
  HierarchyShow,
  HierarchyEdit,
  HierarchyList,
} from './Hierarchies';
import {
  CrossReferenceCreate,
  CrossReferenceShow,
  CrossReferenceEdit,
  CrossReferenceList,
} from './Cross_references';
import {
  VernacularCreate,
  VernacularShow,
  VernacularEdit,
  VernacularList,
} from './Vernaculars';

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
    cross_references: 'cross_reference_id',
    vernaculars: 'vernacular_id',
  },
  {},
  httpClient
);

export const Admin: FC = () => {
  return (
    <ReactAdmin
      loginPage={MyLoginPage}
      dashboard={Dashboard}
      layout={MyLayout}
      authProvider={authProvider}
      dataProvider={dataProvider}
    >
      {(permissions: string) => [
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="users"
            key="user_id"
            list={UserList}
            show={UserShow}
            edit={UserEdit}
            create={UserCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="kingdoms"
            list={KingdomList}
            show={KingdomShow}
            edit={KingdomEdit}
            create={KingdomCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="classification_systems"
            list={ClassificationSystemList}
            show={ClassificationSystemShow}
            edit={ClassificationSystemEdit}
            create={ClassificationSystemCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="authors"
            list={AuthorList}
            show={AuthorShow}
            edit={AuthorEdit}
            create={AuthorCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="taxon_ranks"
            list={TaxonRankList}
            show={TaxonRankShow}
            edit={TaxonRankEdit}
            create={TaxonRankCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="publications"
            list={PublicationList}
            show={PublicationShow}
            edit={PublicationEdit}
            create={PublicationCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="citations"
            list={CitationList}
            show={CitationShow}
            edit={CitationEdit}
            create={CitationCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="taxon_names"
            list={TaxonNameList}
            show={TaxonNameShow}
            edit={TaxonNameEdit}
            create={TaxonNameCreate}
            icon={BookIcon}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="informal_groups"
            list={InformalGroupList}
            show={InformalGroupShow}
            edit={InformalGroupEdit}
            create={InformalGroupCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="hierarchies"
            list={HierarchyList}
            show={HierarchyShow}
            edit={HierarchyEdit}
            create={HierarchyCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="cross_references"
            list={CrossReferenceList}
            show={CrossReferenceShow}
            edit={CrossReferenceEdit}
            create={CrossReferenceCreate}
          />
        ) : null,
        permissions.includes(role.SUPER_ADMIN) ? (
          <Resource
            name="vernaculars"
            list={VernacularList}
            show={VernacularShow}
            edit={VernacularEdit}
            create={VernacularCreate}
          />
        ) : null,
      ]}
    </ReactAdmin>
  );
};
