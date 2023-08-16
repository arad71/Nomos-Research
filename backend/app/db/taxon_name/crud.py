from typing import List

from fastapi import HTTPException, status
from pydantic import parse_obj_as
from sqlalchemy.orm import Session, aliased

import app.db.crud as crud
import app.db.taxon_name.schema as schema
from app.db.hierarchy.model import Hierarchy
from app.db.informal_group.model import InformalGroup
from app.db.taxon_name.infrageneric_names import (
    InfraGenericNameModel,
    InfraGenericNames,
)
from app.db.taxon_name.model import TaxonName
from app.db.taxon_rank.model import TaxonRank
from app.db.user.model import User


class TaxonNameCrud(crud.Crud):
    model = TaxonName
    id_key = "taxon_name_id"
    name = "Taxon Name"
    search_fields = [
        "scientific_name",
        "author",
        "all_vernaculars",
        "cross_referenced_old_name___new_name___scientific_name",
    ]

    @classmethod
    def create_item(
        cls,
        db: Session,
        taxon_name: schema.TaxonNameCreate,
        current_user: int = None,
    ) -> TaxonName:
        create_data = taxon_name.dict(exclude_unset=True)
        delattr(taxon_name, "classification_system_ids")
        db_taxon_name = super().create_item(db, taxon_name, current_user=current_user)
        if (
            "classification_system_ids" in create_data
            and create_data["classification_system_ids"]
        ):
            for classification_system_id in create_data["classification_system_ids"]:
                informal_group = InformalGroup(
                    classification_system_id=classification_system_id,
                    taxon_name_id=db_taxon_name.taxon_name_id,
                    created_by=current_user,
                    updated_by=current_user,
                )
                db.add(informal_group)
            db.commit()
        return db_taxon_name

    @classmethod
    def edit_item(
        cls,
        db: Session,
        current_user: User,
        taxon_name_id: int,
        taxon_name: schema.TaxonNameEdit,
        **kwargs,
    ) -> TaxonName:
        update_data = taxon_name.dict(exclude_unset=True)
        if "classification_system_ids" in update_data:
            classification_system_ids = update_data["classification_system_ids"]
            db.query(InformalGroup).filter(
                InformalGroup.taxon_name_id == taxon_name_id,
                ~InformalGroup.classification_system_id.in_(classification_system_ids),
            ).delete()
            current_classification_system_ids = [
                classification_system_id[0]
                for classification_system_id in db.query(
                    InformalGroup.classification_system_id
                )
                .filter(InformalGroup.taxon_name_id == taxon_name_id)
                .all()
            ]
            new_classification_system_ids = set(classification_system_ids) ^ set(
                current_classification_system_ids
            )
            for classification_system_id in new_classification_system_ids:
                informal_group = InformalGroup(
                    taxon_name_id=taxon_name_id,
                    classification_system_id=classification_system_id,
                    created_by=current_user.user_id,
                    updated_by=current_user.user_id,
                )
                db.add(informal_group)
            db.commit()
            delattr(taxon_name, "classification_system_ids")
        db_taxon_name = super().edit_item(db, current_user, taxon_name_id, taxon_name)
        return db_taxon_name

    @classmethod
    def generate_infrageneric_names(
        cls,
        db: Session,
        taxon_name_id: int,
    ) -> List[InfraGenericNameModel]:
        # This query returns a result with a full hierarchy list for a single taxon_id
        hierarchy = aliased(Hierarchy)
        taxon_name = aliased(TaxonName)
        taxon_rank = aliased(TaxonRank)

        subquery = (
            db.query(hierarchy.path, hierarchy.parent_nid)
            .filter(hierarchy.taxon_name_id == taxon_name_id)
            .subquery()
        )
        sub = aliased(Hierarchy, subquery)

        query = (
            db.query(
                taxon_name.taxon_name_id,
                hierarchy.path,
                taxon_name.scientific_name,
                taxon_name.uninomial,
                taxon_name.specific_epithet,
                taxon_name.infraspecific_epithet,
                taxon_name.author,
                taxon_rank.rank_name,
                taxon_rank.rank_abbrev,
                hierarchy.parent_nid,
            )
            .distinct()
            .join(hierarchy, taxon_name.taxon_name_id == hierarchy.taxon_name_id)
            .join(sub, hierarchy.path.op("@>")(sub.path))
            .join(taxon_rank, taxon_name.rank_id == taxon_rank.taxon_rank_id)
            .filter(taxon_name.deleted == False)
            .order_by(hierarchy.path)
        )

        result = query.all()

        if not result:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, detail=f"Taxon ID {taxon_name_id} not found"
            )

        # Convert the result to a list of dictionaries for script ingestion
        rows = parse_obj_as(List[schema.TaxonNameRow], result)
        infrageneric_names = InfraGenericNames.generate_names(taxon_name_id, rows)
        return infrageneric_names
