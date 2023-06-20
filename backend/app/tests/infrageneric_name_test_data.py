"""
The data in this file is intended to represent the following test table to test
name generatio results from different combinations of defined taxon hierarchies.


Taxonomic Rank Category | Rank        | Uninomial  | Specific Epithet | Infraspecific Epithet | Valid name contributors | Abbreviation | Selection Order | Test: Lowest Only | Test: Highest Only | Test: Mixed | Test: Full | Test: Invalid
------------------------|-------------|------------|------------------|-----------------------|------------------------|--------------|-----------------|-------------------|--------------------|-------------|------------|----------------
Higher order (> Genus)  | N/A         | N/A        | --               | --                    | --                     | --           | --              | --                | --                 | --          | --         | --
Genus                   | Genus       | Genus      | --               | --                    | Genus                  | --           | 1               | valid             | valid              | valid       | valid      | valid
Infragenus              | Subgenus    | Subgenus   | --               | --                    | Subgenus               | subg.        | 6               | --                | valid              | valid       | valid      | --
Infragenus              | Section     | Section    | --               | --                    | Section                | sect.        | 5               | --                | --                 | valid       | valid      | --
Infragenus              | Subsection  | Subsection | --               | --                    | Subsection             | subsect.     | 4               | --                | --                 | valid       | valid      | --
Infragenus              | Series      | Series     | --               | --                    | Series                 | ser.         | 3               | --                | --                 | --          | valid      | --
Infragenus              | Subseries   | Subseries  | --               | --                    | Subseries              | subser.      | 2               | --                | --                 | --          | valid      | --
Infragenus              | Superspecies| Superspecies | --             | --                    | Superspecies           | supersp.     | 1               | valid             | --                 | --          | valid      | valid
Species                 | Species     | Fail       | species          | --                    | species                | --           | 1               | valid             | valid              | valid       | valid      | valid
Infraspecies            | Subspecies  | Fail       | fail             | subspecies            | subspecies             | subsp.       | 5               | --                | valid              | valid       | valid      | --
Infraspecies            | Variety     | Fail       | fail             | variety               | variety                | var.         | 4               | --                | --                 | valid       | valid      | --
Infraspecies            | Subvariety  | Fail       | fail             | subvariety            | subvariety             | subvar.      | 3               | --                | --                 | valid       | valid      | --
Infraspecies            | Form        | Fail       | fail             | form                  | form                   | forma        | 2               | --                | --                 | --          | valid      | --
Infraspecies            | Subform     | Fail       | fail             | subform               | subform                | subforma     | 1               | valid             | --                 | --          | valid      | invalid

"""




Division =        {'taxon_name_id': 26680,  'uninomial': 'Magnoliophyta', 'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Division',     'rank_abbrev': None}
Class =           {'taxon_name_id': 26690,  'uninomial': 'Magnoliopsida', 'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Class',        'rank_abbrev': None}
Order =           {'taxon_name_id': 26700,  'uninomial': 'Asterales',     'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Order',        'rank_abbrev': None}
Family =          {'taxon_name_id': 16441,  'uninomial': 'Asteraceae',    'specific_epithet': None,      'infraspecific_epithet': None,         'author': 'Bercht. & J.Presl', 'rank_name': 'Family',       'rank_abbrev': None}
Genus =           {'taxon_name_id': 13483,  'uninomial': 'Genus',         'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Genus',        'rank_abbrev': None}
Subgenus =        {'taxon_name_id': 162756, 'uninomial': 'Subgenus',      'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Subgenus',     'rank_abbrev': 'subg'}
Section =         {'taxon_name_id': 162757, 'uninomial': 'Section',       'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Section',      'rank_abbrev': 'sect'}
Subsection =      {'taxon_name_id': 162758, 'uninomial': 'Subsection',    'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Subsection',   'rank_abbrev': 'subsect'}
Series =          {'taxon_name_id': 162759, 'uninomial': 'Series',        'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Series',       'rank_abbrev': 'ser'}
Subseries =       {'taxon_name_id': 162760, 'uninomial': 'Subseries',     'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Subseries',    'rank_abbrev': 'subser'}
Superspecies =    {'taxon_name_id': 162761, 'uninomial': 'Superspecies',  'specific_epithet': None,      'infraspecific_epithet': None,         'author': None,                'rank_name': 'Superspecies', 'rank_abbrev': 'supersp'}
Species =         {'taxon_name_id': 162762, 'uninomial': 'Fail',          'specific_epithet': 'species', 'infraspecific_epithet': None,         'author': None,                'rank_name': 'Species',      'rank_abbrev': None}
Subspecies =      {'taxon_name_id': 162763, 'uninomial': 'Fail',          'specific_epithet': 'fail',    'infraspecific_epithet': 'subspecies', 'author': '(S A) F A',         'rank_name': 'Subspecies',   'rank_abbrev': 'subsp'}
Variety =         {'taxon_name_id': 162764, 'uninomial': 'Fail',          'specific_epithet': 'fail',    'infraspecific_epithet': 'variety',    'author': None,                'rank_name': 'Variety',      'rank_abbrev': 'var'}
Subvariety =      {'taxon_name_id': 162765, 'uninomial': 'Fail',          'specific_epithet': 'fail',    'infraspecific_epithet': 'subvariety', 'author': None,                'rank_name': 'Subvariety',   'rank_abbrev': 'subvar'}
Form =            {'taxon_name_id': 162766, 'uninomial': 'Fail',          'specific_epithet': 'fail',    'infraspecific_epithet': 'form',       'author': '(F A)',             'rank_name': 'Form',         'rank_abbrev': 'forma'}
Subform =         {'taxon_name_id': 162767, 'uninomial': 'Fail',          'specific_epithet': 'fail',    'infraspecific_epithet': 'subform',    'author': '(SF A)',            'rank_name': 'Subform',      'rank_abbrev': 'subforma'}
Invalid_subform = {'taxon_name_id': 162767, 'uninomial': 'Fail',          'specific_epithet': 'subform', 'infraspecific_epithet': None,         'author': '(SF A)',            'rank_name': 'Subform',      'rank_abbrev': 'subforma'}

# full hierarchy words
# Genus
# subg. Subgenus
# sect. Section
# subsect. Subsection
# ser. Series
# subser. Subseries
# supersp. Superspecies
# species
# subsp. subspecies
# var. variety
# subvar. subvariety
# forma form
# subforma subform

full_hierarchy_set_162767 = [Division,
                      Class,
                      Order,
                      Family,
                      Genus,
                      Subgenus,
                      Section,
                      Subsection,
                      Series,
                      Subseries,
                      Superspecies,
                      Species,
                      Subspecies,
                      Variety,
                      Subvariety,
                      Form,
                      Subform]

minimum_set_lowest_hierarchy_162767 = [Genus, Superspecies, Species, Subform]
minimum_set_highest_hierarchy_162763 = [Genus, Subgenus, Species, Subspecies]
mixed_set_medium_hierarchy_162765 = [Genus, Subgenus, Section, Subsection, Species, Subspecies, Variety, Subvariety]
minimum_set_invalid_lowest_162767 = [Genus, Superspecies, Species, Invalid_subform]


expected_full_hierarchy_set_162767 = [
    {"name_version": "Canonical",
     "formatted_name": "Genus species subforma subform"},
    {"name_version": "Canonical without rank",
     "formatted_name": "Genus species subform"},
    {"name_version": "Infragenus",
     "formatted_name": "Genus (Superspecies) species subforma subform"},
    {"name_version": "Infragenus with rank",
     "formatted_name": "Genus (supersp. Superspecies) species subforma subform"},
    {"name_version": "Infragenus without parentheses", "formatted_name": "Genus supersp. Superspecies species subforma subform"},
    {"name_version": "Full hierarchy", "formatted_name": "Genus subg. Subgenus sect. Section subsect. Subsection ser. Series subser. Subseries supersp. Superspecies species subsp. subspecies var. variety subvar. subvariety forma form subforma subform"}
]

expected_minimum_set_lowest_hierarchy_162767 = [
    {"name_version": "Canonical",
     "formatted_name": "Genus species subforma subform"},
    {"name_version": "Canonical without rank",
     "formatted_name": "Genus species subform"},
    {"name_version": "Infragenus",
     "formatted_name": "Genus (Superspecies) species subforma subform"},
    {"name_version": "Infragenus with rank",
     "formatted_name": "Genus (supersp. Superspecies) species subforma subform"},
    {"name_version": "Infragenus without parentheses", "formatted_name": "Genus supersp. Superspecies species subforma subform"},
    {"name_version": "Full hierarchy", "formatted_name": "Genus supersp. Superspecies species subforma subform"}
]

expected_minimum_set_highest_hierarchy_162763 = [
    {"name_version": "Canonical",
     "formatted_name": "Genus species subsp. subspecies"},
    {"name_version": "Canonical without rank",
     "formatted_name": "Genus species subspecies"},
    {"name_version": "Infragenus",
     "formatted_name": "Genus (Subgenus) species subsp. subspecies"},
    {"name_version": "Infragenus with rank",
     "formatted_name": "Genus (subg. Subgenus) species subsp. subspecies"},
    {"name_version": "Infragenus without parentheses", "formatted_name": "Genus subg. Subgenus species subsp. subspecies"},
    {"name_version": "Full hierarchy", "formatted_name": "Genus subg. Subgenus species subsp. subspecies"}
]

expected_mixed_set_medium_hierarchy_162765 = [
    {"name_version": "Canonical",
     "formatted_name": "Genus species subvar. subvariety"},
    {"name_version": "Canonical without rank",
     "formatted_name": "Genus species subvariety"},
    {"name_version": "Infragenus",
     "formatted_name": "Genus (Subsection) species subvar. subvariety"},
    {"name_version": "Infragenus with rank",
     "formatted_name": "Genus (subsect. Subsection) species subvar. subvariety"},
    {"name_version": "Infragenus without parentheses", "formatted_name": "Genus subsect. Subsection species subvar. subvariety"},
    {"name_version": "Full hierarchy", "formatted_name": "Genus subg. Subgenus sect. Section subsect. Subsection species subsp. subspecies var. variety subvar. subvariety"}
]
expected_minimum_set_invalid_lowest_162767 = [
{"name_version": "Canonical",
"formatted_name": ""},
{"name_version": "Canonical without rank",
 "formatted_name": ""},
{"name_version": "Infragenus",
 "formatted_name": ""},
{"name_version": "Infragenus with rank",
 "formatted_name": ""},
{"name_version": "Infragenus without parentheses",
 "formatted_name": ""},
{"name_version": "Full hierarchy",
 "formatted_name": ""},
]

# Genus
# subg. Subgenus
# sect. Section
# subsect. Subsection
# ser. Series
# subser. Subseries
# supersp. Superspecies
# species
# subsp. subspecies
# var. variety
# subvar. subvariety
# forma form
# subforma subform




# temp_process_result = [InfraGenericNameModel(formatted_name='Genus species forma form', name_version='Canonical', author='(F A)', formatted_name_with_author='Genus species forma form (F A)', contributing_taxons=[(13483, 'Genus'), (162759, 'species'), (162763, 'form')], info=None, searched_taxon_id=162763),
#                        InfraGenericNameModel(formatted_name='Genus species form', name_version='Canonical without rank', author='(F A)', formatted_name_with_author='Genus species form (F A)', contributing_taxons=[(13483, 'Genus'), (162759, 'species'), (162763, 'form')], info=None, searched_taxon_id=162763),
#                        InfraGenericNameModel(formatted_name='Genus (Subsection) species forma form', name_version='Infragenus', author='(F A)', formatted_name_with_author='Genus (Subsection) species forma form (F A)', contributing_taxons=[(13483, 'Genus'), (162758, 'Subsection'), (162759, 'species'), (162763, 'form')], info=None, searched_taxon_id=162763),
#                        InfraGenericNameModel(formatted_name='Genus (subsect. Subsection) species forma form', name_version='Infragenus with rank', author='(F A)', formatted_name_with_author='Genus (subsect. Subsection) species forma form (F A)', contributing_taxons=[(13483, 'Genus'), (162758, 'Subsection'), (162759, 'species'), (162763, 'form')], info=None, searched_taxon_id=162763),
#                        InfraGenericNameModel(formatted_name='Genus subsect. Subsection species forma form', name_version='Infragenus without parentheses', author='(F A)', formatted_name_with_author='Genus subsect. Subsection species forma form (F A)', contributing_taxons=[(13483, 'Genus'), (162758, 'Subsection'), (162759, 'species'), (162763, 'form')], info=None, searched_taxon_id=162763)]
