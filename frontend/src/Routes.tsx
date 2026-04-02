import React, { FC } from 'react';
import { Navigate, Route, Routes as ReactRouterRoutes } from 'react-router-dom';
import makeStyles from 'lib/makeStyles';

import { SignUp } from './views';
import NewLogin from './views/NewLogin';
import AdminKitApp from './kit/app/AdminKitApp';
import AccessGuard from './kit/shared/AccessGuard';
import AccessDeniedPage from './kit/shared/AccessDeniedPage';
import KitAdminProvider from './kit/app/KitAdminProvider';
import AdminKitLayout from './kit/app/AdminKitLayout';
import AuthorCreatePage from './kit/authors/AuthorCreatePage';
import AuthorEditPage from './kit/authors/AuthorEditPage';
import AuthorShowPage from './kit/authors/AuthorShowPage';
import AuthorsPage from './kit/authors/AuthorsPage';
import CitationCreatePage from './kit/citations/CitationCreatePage';
import CitationEditPage from './kit/citations/CitationEditPage';
import CitationShowPage from './kit/citations/CitationShowPage';
import ClassificationSystemCreatePage from './kit/classification-systems/ClassificationSystemCreatePage';
import ClassificationSystemEditPage from './kit/classification-systems/ClassificationSystemEditPage';
import ClassificationSystemShowPage from './kit/classification-systems/ClassificationSystemShowPage';
import KingdomCreatePage from './kit/kingdoms/KingdomCreatePage';
import KingdomEditPage from './kit/kingdoms/KingdomEditPage';
import CitationsPage from './kit/citations/CitationsPage';
import ConservationCodesPage from './kit/conservation-codes/ConservationCodesPage';
import ConservationCodeCreatePage from './kit/conservation-codes/ConservationCodeCreatePage';
import ConservationCodeEditPage from './kit/conservation-codes/ConservationCodeEditPage';
import ConservationCodeShowPage from './kit/conservation-codes/ConservationCodeShowPage';
import ConscodeTaxonCreatePage from './kit/conscode-taxons/ConscodeTaxonCreatePage';
import ConscodeTaxonEditPage from './kit/conscode-taxons/ConscodeTaxonEditPage';
import ConscodeTaxonShowPage from './kit/conscode-taxons/ConscodeTaxonShowPage';
import ConscodeTaxonsPage from './kit/conscode-taxons/ConscodeTaxonsPage';
import CrossReferenceCreatePage from './kit/cross-references/CrossReferenceCreatePage';
import CrossReferenceEditPage from './kit/cross-references/CrossReferenceEditPage';
import CrossReferenceShowPage from './kit/cross-references/CrossReferenceShowPage';
import CrossReferencesPage from './kit/cross-references/CrossReferencesPage';
import ClassificationSystemsPage from './kit/classification-systems/ClassificationSystemsPage';
import HierarchyCreatePage from './kit/hierarchies/HierarchyCreatePage';
import HierarchyEditPage from './kit/hierarchies/HierarchyEditPage';
import HierarchyShowPage from './kit/hierarchies/HierarchyShowPage';
import HierarchiesPage from './kit/hierarchies/HierarchiesPage';
import InformalGroupsPage from './kit/informal-groups/InformalGroupsPage';
import InformalGroupCreatePage from './kit/informal-groups/InformalGroupCreatePage';
import InformalGroupEditPage from './kit/informal-groups/InformalGroupEditPage';
import InformalGroupShowPage from './kit/informal-groups/InformalGroupShowPage';
import KingdomsPage from './kit/kingdoms/KingdomsPage';
import KingdomShowPage from './kit/kingdoms/KingdomShowPage';
import KitResourcePage from './kit/app/KitResourcePage';
import PublicationsPage from './kit/publications/PublicationsPage';
import PublicationCreatePage from './kit/publications/PublicationCreatePage';
import PublicationEditPage from './kit/publications/PublicationEditPage';
import PublicationShowPage from './kit/publications/PublicationShowPage';
import TaxonNameCreatePage from './kit/taxon-names/TaxonNameCreatePage';
import TaxonNameEditPage from './kit/taxon-names/TaxonNameEditPage';
import TaxonNameShowPage from './kit/taxon-names/TaxonNameShowPage';
import TaxonNamesPage from './kit/taxon-names/TaxonNamesPage';
import TaxonNameParentReviewsPage from './kit/taxon-name-parent-reviews/TaxonNameParentReviewsPage';
import TaxonNameCodeCreatePage from './kit/taxon-name-codes/TaxonNameCodeCreatePage';
import TaxonNameCodeEditPage from './kit/taxon-name-codes/TaxonNameCodeEditPage';
import TaxonNameCodeShowPage from './kit/taxon-name-codes/TaxonNameCodeShowPage';
import TaxonNamesCodePage from './kit/taxon-name-codes/TaxonNamesCodePage';
import TaxonRankCreatePage from './kit/taxon-ranks/TaxonRankCreatePage';
import TaxonRankEditPage from './kit/taxon-ranks/TaxonRankEditPage';
import TaxonRankShowPage from './kit/taxon-ranks/TaxonRankShowPage';
import TaxonRanksPage from './kit/taxon-ranks/TaxonRanksPage';
import UserCreatePage from './kit/users/UserCreatePage';
import UserEditPage from './kit/users/UserEditPage';
import UserShowPage from './kit/users/UserShowPage';
import UsersPage from './kit/users/UsersPage';
import VernacularCreatePage from './kit/vernaculars/VernacularCreatePage';
import VernacularEditPage from './kit/vernaculars/VernacularEditPage';
import VernacularShowPage from './kit/vernaculars/VernacularShowPage';
import VernacularsPage from './kit/vernaculars/VernacularsPage';
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
        <Route path="/access-denied" element={<AccessDeniedPage />} />
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
          path="/taxon_name_parent_reviews"
          element={withAccess('taxon_name_parent_reviews', 'list', <TaxonNameParentReviewsPage />)}
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
      <Route
        path="/login"
        element={
          <KitAdminProvider>
            <NewLogin redirectTo="/kit" />
          </KitAdminProvider>
        }
      />
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
          return <Navigate to="/login" replace />;
        })()}
      />
    </ReactRouterRoutes>
  );
};
