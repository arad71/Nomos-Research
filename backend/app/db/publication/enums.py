from enum import Enum


class ReferenceType(str, Enum):
    Book = "Book"
    Chapter = "Chapter"
    Database = "Database"
    DatabaseRecord = "Database record"
    HerbariumAnnotation = "Herbarium annotation"
    Index = "Index"
    Journal = "Journal"
    Paper = "Paper"
    Part = "Part"
    PersonalCommunication = "Personal communication"
    Section = "Section"
    Series = "Series"
