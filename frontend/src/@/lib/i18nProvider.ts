import defaultMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";

const customMessages = {
  resources: {
    authors: {
      notifications: {
        created: "Author saved",
        updated: "Author saved",
      },
    },
    citations: {
      notifications: {
        created: "Citation saved",
        updated: "Citation saved",
      },
    },
    classification_systems: {
      notifications: {
        created: "Classification type saved",
        updated: "Classification type saved",
      },
    },
    conservation_codes: {
      notifications: {
        created: "Conservation code saved",
        updated: "Conservation code saved",
      },
    },
    conscode_taxons: {
      notifications: {
        created: "Cons code taxon saved",
        updated: "Cons code taxon saved",
      },
    },
    cross_references: {
      notifications: {
        created: "Related name saved",
        updated: "Related name saved",
      },
    },
    hierarchies: {
      notifications: {
        created: "Hierarchy saved",
        updated: "Hierarchy saved",
      },
    },
    informal_groups: {
      notifications: {
        created: "Informal group saved",
        updated: "Informal group saved",
      },
    },
    kingdoms: {
      notifications: {
        created: "Kingdom saved",
        updated: "Kingdom saved",
      },
    },
    publications: {
      notifications: {
        created: "Publication saved",
        updated: "Publication saved",
      },
    },
    taxon_names: {
      notifications: {
        created: "Taxon name saved",
        updated: "Taxon name saved",
      },
    },
    taxon_names_code: {
      notifications: {
        created: "Conservation status saved",
        updated: "Conservation status saved",
      },
    },
    taxon_ranks: {
      notifications: {
        created: "Taxon rank saved",
        updated: "Taxon rank saved",
      },
    },
    users: {
      notifications: {
        created: "User saved",
        updated: "User saved",
      },
    },
    vernaculars: {
      notifications: {
        created: "Vernacular name saved",
        updated: "Vernacular name saved",
      },
    },
  },
};

export const i18nProvider = polyglotI18nProvider(
  () => ({
    ...defaultMessages,
    ...customMessages,
    resources: {
      ...defaultMessages.resources,
      ...customMessages.resources,
    },
  }),
  "en",
  [{ name: "en", value: "English" }],
  { allowMissing: true },
);
