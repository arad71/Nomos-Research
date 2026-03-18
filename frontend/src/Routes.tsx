import React, { FC } from 'react';
import { Navigate, Route, Routes as ReactRouterRoutes } from 'react-router-dom';
import makeStyles from 'lib/makeStyles';

import {
  AuthorCreate,
  AuthorEdit,
  AuthorShow,
} from './admin/Authors';
import {
  ClassificationSystemCreate,
  ClassificationSystemEdit,
  ClassificationSystemShow,
} from './admin/Classification_systems';
import {
  KingdomCreate,
  KingdomEdit,
  KingdomShow,
} from './admin/Kingdoms';
import { SignUp } from './views';
import { Admin } from './admin';
import AdminKitApp from './kit/AdminKitApp';
import AccessGuard from './kit/AccessGuard';
import KitAdminProvider from './kit/KitAdminProvider';
import AdminKitLayout from './kit/AdminKitLayout';
import AuthorCreatePage from './kit/AuthorCreatePage';
import AuthorEditPage from './kit/AuthorEditPage';
import AuthorShowPage from './kit/AuthorShowPage';
import AuthorsPage from './kit/AuthorsPage';
import CitationCreatePage from './kit/CitationCreatePage';
import CitationEditPage from './kit/CitationEditPage';
import CitationShowPage from './kit/CitationShowPage';
import ClassificationSystemCreatePage from './kit/ClassificationSystemCreatePage';
import ClassificationSystemEditPage from './kit/ClassificationSystemEditPage';
import ClassificationSystemShowPage from './kit/ClassificationSystemShowPage';
import KingdomCreatePage from './kit/KingdomCreatePage';
import KingdomEditPage from './kit/KingdomEditPage';
import CitationsPage from './kit/CitationsPage';
import ConservationCodesPage from './kit/ConservationCodesPage';
import ConservationCodeCreatePage from './kit/ConservationCodeCreatePage';
import ConservationCodeEditPage from './kit/ConservationCodeEditPage';
import ConservationCodeShowPage from './kit/ConservationCodeShowPage';
import ConscodeTaxonCreatePage from './kit/ConscodeTaxonCreatePage';
import ConscodeTaxonEditPage from './kit/ConscodeTaxonEditPage';
import ConscodeTaxonShowPage from './kit/ConscodeTaxonShowPage';
import ConscodeTaxonsPage from './kit/ConscodeTaxonsPage';
import CrossReferenceCreatePage from './kit/CrossReferenceCreatePage';
import CrossReferenceEditPage from './kit/CrossReferenceEditPage';
import CrossReferenceShowPage from './kit/CrossReferenceShowPage';
import CrossReferencesPage from './kit/CrossReferencesPage';
import ClassificationSystemsPage from './kit/ClassificationSystemsPage';
import HierarchyCreatePage from './kit/HierarchyCreatePage';
import HierarchyEditPage from './kit/HierarchyEditPage';
import HierarchyShowPage from './kit/HierarchyShowPage';
import HierarchiesPage from './kit/HierarchiesPage';
import InformalGroupsPage from './kit/InformalGroupsPage';
import InformalGroupCreatePage from './kit/InformalGroupCreatePage';
import InformalGroupEditPage from './kit/InformalGroupEditPage';
import InformalGroupShowPage from './kit/InformalGroupShowPage';
import KingdomsPage from './kit/KingdomsPage';
import KingdomShowPage from './kit/KingdomShowPage';
import KitResourcePage from './kit/KitResourcePage';
import PublicationsPage from './kit/PublicationsPage';
import PublicationCreatePage from './kit/PublicationCreatePage';
import PublicationEditPage from './kit/PublicationEditPage';
import PublicationShowPage from './kit/PublicationShowPage';
import TaxonNameCreatePage from './kit/TaxonNameCreatePage';
import TaxonNameEditPage from './kit/TaxonNameEditPage';
import TaxonNameShowPage from './kit/TaxonNameShowPage';
import TaxonNamesPage from './kit/TaxonNamesPage';
import TaxonNameCodeCreatePage from './kit/TaxonNameCodeCreatePage';
import TaxonNameCodeEditPage from './kit/TaxonNameCodeEditPage';
import TaxonNameCodeShowPage from './kit/TaxonNameCodeShowPage';
import TaxonNamesCodePage from './kit/TaxonNamesCodePage';
import TaxonRankCreatePage from './kit/TaxonRankCreatePage';
import TaxonRankEditPage from './kit/TaxonRankEditPage';
import TaxonRankShowPage from './kit/TaxonRankShowPage';
import TaxonRanksPage from './kit/TaxonRanksPage';
import UserCreatePage from './kit/UserCreatePage';
import UserEditPage from './kit/UserEditPage';
import UserShowPage from './kit/UserShowPage';
import UsersPage from './kit/UsersPage';
import VernacularCreatePage from './kit/VernacularCreatePage';
import VernacularEditPage from './kit/VernacularEditPage';
import VernacularShowPage from './kit/VernacularShowPage';
import VernacularsPage from './kit/VernacularsPage';
import { logout } from './utils';

const useStyles = makeStyles(() => ({
  app: {
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fafafa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },
}));

export const Routes: FC = () => {
  const classes = useStyles();
  const withAccess = (
    resource: string,
    action: string,
    element: React.ReactElement
  ) => (
    <AccessGuard resource={resource} action={action}>
      {element}
    </AccessGuard>
  );

  return (
    <ReactRouterRoutes>
      <Route
        element={
          <KitAdminProvider>
            <AdminKitLayout />
          </KitAdminProvider>
        }
      >
        <Route path="/" element={<AdminKitApp />} />
        <Route path="/kit" element={<AdminKitApp />} />
        <Route
          path="/taxon_names"
          element={withAccess('taxon_names', 'list', <TaxonNamesPage />)}
        />
        <Route
          path="/taxon_names/create"
          element={withAccess('taxon_names', 'create', <TaxonNameCreatePage />)}
        />
        <Route
          path="/taxon_names/:id"
          element={withAccess('taxon_names', 'edit', <TaxonNameEditPage />)}
        />
        <Route
          path="/taxon_names/:id/show"
          element={withAccess('taxon_names', 'show', <TaxonNameShowPage />)}
        />
        <Route
          path="/taxon_names_code"
          element={withAccess('taxon_names', 'list', <TaxonNamesCodePage />)}
        />
        <Route
          path="/taxon_names_code/create"
          element={withAccess('conscode_taxons', 'create', <TaxonNameCodeCreatePage />)}
        />
        <Route
          path="/taxon_names_code/:id"
          element={withAccess('taxon_names', 'edit', <TaxonNameCodeEditPage />)}
        />
        <Route
          path="/taxon_names_code/:id/show"
          element={withAccess('taxon_names', 'show', <TaxonNameCodeShowPage />)}
        />
        <Route
          path="/cross_references"
          element={withAccess('cross_references', 'list', <CrossReferencesPage />)}
        />
        <Route
          path="/cross_references/create"
          element={withAccess('cross_references', 'create', <CrossReferenceCreatePage />)}
        />
        <Route
          path="/cross_references/:id"
          element={withAccess('cross_references', 'edit', <CrossReferenceEditPage />)}
        />
        <Route
          path="/cross_references/:id/show"
          element={withAccess('cross_references', 'show', <CrossReferenceShowPage />)}
        />
        <Route
          path="/hierarchies"
          element={withAccess('hierarchies', 'list', <HierarchiesPage />)}
        />
        <Route
          path="/hierarchies/create"
          element={withAccess('hierarchies', 'create', <HierarchyCreatePage />)}
        />
        <Route
          path="/hierarchies/:id"
          element={withAccess('hierarchies', 'edit', <HierarchyEditPage />)}
        />
        <Route
          path="/hierarchies/:id/show"
          element={withAccess('hierarchies', 'show', <HierarchyShowPage />)}
        />
        <Route
          path="/kingdoms"
          element={withAccess('kingdoms', 'list', <KingdomsPage />)}
        />
        <Route
          path="/kingdoms/create"
          element={withAccess('kingdoms', 'create', <KingdomCreatePage />)}
        />
        <Route
          path="/kingdoms/:id"
          element={withAccess('kingdoms', 'edit', <KingdomEditPage />)}
        />
        <Route
          path="/kingdoms/:id/show"
          element={withAccess('kingdoms', 'show', <KingdomShowPage />)}
        />
        <Route
          path="/classification_systems"
          element={withAccess('classification_systems', 'list', <ClassificationSystemsPage />)}
        />
        <Route
          path="/classification_systems/create"
          element={withAccess('classification_systems', 'create', <ClassificationSystemCreatePage />)}
        />
        <Route
          path="/classification_systems/:id"
          element={withAccess('classification_systems', 'edit', <ClassificationSystemEditPage />)}
        />
        <Route
          path="/classification_systems/:id/show"
          element={withAccess('classification_systems', 'show', <ClassificationSystemShowPage />)}
        />
        <Route
          path="/informal_groups"
          element={withAccess('informal_groups', 'list', <InformalGroupsPage />)}
        />
        <Route
          path="/informal_groups/create"
          element={withAccess('informal_groups', 'create', <InformalGroupCreatePage />)}
        />
        <Route
          path="/informal_groups/:id"
          element={withAccess('informal_groups', 'edit', <InformalGroupEditPage />)}
        />
        <Route
          path="/informal_groups/:id/show"
          element={withAccess('informal_groups', 'show', <InformalGroupShowPage />)}
        />
        <Route
          path="/taxon_ranks"
          element={withAccess('taxon_ranks', 'list', <TaxonRanksPage />)}
        />
        <Route
          path="/taxon_ranks/create"
          element={withAccess('taxon_ranks', 'create', <TaxonRankCreatePage />)}
        />
        <Route
          path="/taxon_ranks/:id"
          element={withAccess('taxon_ranks', 'edit', <TaxonRankEditPage />)}
        />
        <Route
          path="/taxon_ranks/:id/show"
          element={withAccess('taxon_ranks', 'show', <TaxonRankShowPage />)}
        />
        <Route
          path="/publications"
          element={withAccess('publications', 'list', <PublicationsPage />)}
        />
        <Route
          path="/publications/create"
          element={withAccess('publications', 'create', <PublicationCreatePage />)}
        />
        <Route
          path="/publications/:id"
          element={withAccess('publications', 'edit', <PublicationEditPage />)}
        />
        <Route
          path="/publications/:id/show"
          element={withAccess('publications', 'show', <PublicationShowPage />)}
        />
        <Route
          path="/authors"
          element={withAccess('authors', 'list', <AuthorsPage />)}
        />
        <Route
          path="/authors/create"
          element={withAccess('authors', 'create', <AuthorCreatePage />)}
        />
        <Route
          path="/authors/:id"
          element={withAccess('authors', 'edit', <AuthorEditPage />)}
        />
        <Route
          path="/authors/:id/show"
          element={withAccess('authors', 'show', <AuthorShowPage />)}
        />
        <Route
          path="/citations"
          element={withAccess('citations', 'list', <CitationsPage />)}
        />
        <Route
          path="/citations/create"
          element={withAccess('citations', 'create', <CitationCreatePage />)}
        />
        <Route
          path="/citations/:id"
          element={withAccess('citations', 'edit', <CitationEditPage />)}
        />
        <Route
          path="/citations/:id/show"
          element={withAccess('citations', 'show', <CitationShowPage />)}
        />
        <Route
          path="/conservation_codes"
          element={withAccess('conservation_codes', 'list', <ConservationCodesPage />)}
        />
        <Route
          path="/conservation_codes/create"
          element={withAccess('conservation_codes', 'create', <ConservationCodeCreatePage />)}
        />
        <Route
          path="/conservation_codes/:id"
          element={withAccess('conservation_codes', 'edit', <ConservationCodeEditPage />)}
        />
        <Route
          path="/conservation_codes/:id/show"
          element={withAccess('conservation_codes', 'show', <ConservationCodeShowPage />)}
        />
        <Route
          path="/conscode_taxons"
          element={withAccess('conscode_taxons', 'list', <ConscodeTaxonsPage />)}
        />
        <Route
          path="/conscode_taxons/create"
          element={withAccess('conscode_taxons', 'create', <ConscodeTaxonCreatePage />)}
        />
        <Route
          path="/conscode_taxons/:id"
          element={withAccess('conscode_taxons', 'edit', <ConscodeTaxonEditPage />)}
        />
        <Route
          path="/conscode_taxons/:id/show"
          element={withAccess('conscode_taxons', 'show', <ConscodeTaxonShowPage />)}
        />
        <Route
          path="/vernaculars"
          element={withAccess('vernaculars', 'list', <VernacularsPage />)}
        />
        <Route
          path="/vernaculars/create"
          element={withAccess('vernaculars', 'create', <VernacularCreatePage />)}
        />
        <Route
          path="/vernaculars/:id"
          element={withAccess('vernaculars', 'edit', <VernacularEditPage />)}
        />
        <Route
          path="/vernaculars/:id/show"
          element={withAccess('vernaculars', 'show', <VernacularShowPage />)}
        />
        <Route
          path="/users"
          element={withAccess('users', 'list', <UsersPage />)}
        />
        <Route
          path="/users/create"
          element={withAccess('users', 'create', <UserCreatePage />)}
        />
        <Route
          path="/users/:id"
          element={withAccess('users', 'edit', <UserEditPage />)}
        />
        <Route
          path="/users/:id/show"
          element={withAccess('users', 'show', <UserShowPage />)}
        />
      </Route>
      <Route path="/legacy/*" element={<Admin />} />
      <Route
        path="/signup"
        element={
          <div className={classes.app}>
            <header className={classes.header}>
              <SignUp />
            </header>
          </div>
        }
      />
      <Route
        path="/logout"
        element={(() => {
          logout();
          return <Navigate to="/kit" replace />;
        })()}
      />
    </ReactRouterRoutes>
  );
};
