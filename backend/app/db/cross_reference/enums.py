from enum import Enum


class CrossReferenceType(str, Enum):
    orthographic_variant = "orthographic_variant"
    excluded_name = "excluded_name"
    misapplied_name = "misapplied_name"
    subjective_synonym = "subjective_synonym"
    objective_synonym = "objective_synonym"
    concept_change = "concept_change"
    formal_description = "formal_description"
    name_entered_in_error = "name_entered_in_error"
    isonym = "isonym"


CROSS_REFERENCE_TYPE_EXPORT_VALUES = {
    CrossReferenceType.subjective_synonym: "taxonomic_synonym",
    CrossReferenceType.objective_synonym: "nomenclatural_synonym",
    CrossReferenceType.isonym: "informal_synonym",
}
