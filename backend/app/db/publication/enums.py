from enum import Enum


class ReferenceType(str, Enum):
    Book = "Book"
    Chapter = "Chapter"
    Paper = "Conference paper"
    Database = "Database"
    DatabaseRecord = "Database record"
    HerbariumAnnotation = "Herbarium annotation"
    Index = "Index"
    Journal = "Journal"
    JournalArticle = "Journal article"
    Part = "Part"
    PersonalCommunication = "Personal communication"
    Section = "Section"
    Series = "Series"
