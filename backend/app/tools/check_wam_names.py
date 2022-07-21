#!/usr/bin/env python3
# script to parse out name information using gnparser
import os.path

import pandas as pd
import requests
from loguru import logger
from numpy import NaN
from pandas import Series

EXPORT_SUFFIX = "GNParsed.csv"
SMALL_SUFFIX = "GNParsedSmall.csv"
SOURCE_FILE = "/app/WAMChecklistNameLookupJUNE.csv"
GNPARSER_URL = "https://parser.globalnames.org/api/v1/"


def check_wam_names(source_file: str = SOURCE_FILE):
    def extract_values(row: Series, container, field):
        extracted_value = None
        extract = row.get(container, {})
        if extract is not NaN:
            extracted_value = extract.get(field, None)
        return extracted_value

    def calculate_import_to_nomos(row: Series):
        ret = bool(row["parsed"])
        if row["quality"] >= 3:
            ret = False
        return ret

    logger.info("Extracting data from: {}", source_file)
    source = pd.read_csv(
        source_file, chunksize=1000, encoding="cp65001", encoding_errors="ignore"
    )
    out = pd.DataFrame()
    chunk: pd.DataFrame
    for chunk in source:
        # convert unicode diacritics into individual characters to prevent problems
        # with accents
        logger.debug("Processing row {}", min(chunk.index))
        logger.debug(chunk)
        df = pd.DataFrame(chunk)
        # So that both df and result_df have the same index
        df.reset_index(drop=True, inplace=True)
        df["Kingdom"].fillna("Animalia", inplace=True)
        df["OriginalNameAccepted"] = df["NameAccepted"]
        df["NameAccepted"] = df["NameAccepted"].str.normalize("NFC")
        names = df["NameAccepted"]
        new_names = list()
        for name in names:
            new_names.append(str(name))

        json = {"names": new_names, "withDetails": True, "csv": False}
        r = requests.post(GNPARSER_URL, json=json)
        result = r.json()
        result_df = pd.DataFrame(result)
        result_df["canonical_name"] = result_df.apply(
            extract_values, args=("canonical", "full"), axis="columns"
        )
        result_df["canonical_name_without_rank"] = result_df.apply(
            extract_values, args=("canonical", "simple"), axis="columns"
        )
        result_df["author"] = result_df.apply(
            extract_values, args=("authorship", "authors"), axis="columns"
        )
        result_df["verbatim_authors"] = result_df.apply(
            extract_values, args=("authorship", "verbatim"), axis="columns"
        )
        result_df["year_published"] = result_df.apply(
            extract_values, args=("authorship", "year"), axis="columns"
        )
        result_df["parenthetical"] = result_df["verbatim_authors"].str.contains("\\(")

        combined = pd.concat([df, result_df], axis=1)
        logger.debug(combined)
        # Set Rank to Subspecies if cardinality = 3
        combined.loc[(combined["cardinality"] == 3), "Rank"] = "Subspecies"

        combined["is_current"] = combined["lookupStatus"] != "SYNONYM"
        combined["validated"] = combined["lookupStatus"] != "SYNONYM"
        combined["import_to_nomos"] = combined.apply(
            calculate_import_to_nomos, axis="columns"
        )
        logger.debug("Extracted data:")
        logger.debug(combined)
        out = pd.concat([out, combined], axis=0, ignore_index=True)
    export_file = os.path.splitext(source_file)[0]
    export_file_name = export_file + EXPORT_SUFFIX
    out.to_csv(export_file_name)
    columns = [
        "NameID",
        "File_NameID",
        "Kingdom",
        "Rank",
        "canonical_name_without_rank",
        "author",
        "year_published",
        "parenthetical",
        "is_current",
        "validated",
        "import_to_nomos",
        "qualityWarnings",
    ]
    logger.info("Exported data file to {}", export_file)
    small_file_name = export_file + SMALL_SUFFIX
    out[columns].to_csv(small_file_name)
    logger.info("Exported data file to {}", small_file_name)


if __name__ == "__main__":
    check_wam_names()
