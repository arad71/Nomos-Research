#!/usr/bin/env python3
import re
from typing import List, Set

from loguru import logger
from sqlalchemy import update
from sqlalchemy.orm import Session
from sqlalchemy_utils import Ltree

from app.db.session import get_db
from app.model import Hierarchy


def strip_space(string):
    return re.sub(r"\W+", "_", string)


def rebuild_hierarchy_paths(session: Session):
    logger.info("Rebuilding hierarchy paths")
    Hierarchy.set_session(session)
    logger.debug("Clearing out existing hierarchy paths")
    stmt = update(Hierarchy).values(path=None)
    session.execute(stmt)
    q = Hierarchy.where(path=None)
    calculate_path_for_hierarchy_roots(q.all())
    session.flush()
    session.commit()


def clear_hierarchy_path(session: Session, hierarchy: Hierarchy):
    child_set = child_ids(hierarchy)
    stat = (
        update(Hierarchy).where(Hierarchy.hierarchy_id.in_(child_set)).values(path=None)
    )
    session.execute(stat)


def find_root_parent(hierarchy: Hierarchy):
    logger.debug("Finding parent for {}", hierarchy.taxon_name.scientific_name)
    parent = hierarchy.direct_parent
    if parent:
        parent = find_root_parent(hierarchy.direct_parent)
    return parent or hierarchy


def child_ids(hierarchy: Hierarchy, include_self: bool = True) -> Set[int]:
    ids = set()
    if include_self:
        ids.add(hierarchy.hierarchy_id)
    child: Hierarchy
    for child in hierarchy.direct_children:
        ids.add(child.hierarchy_id)
        ids.update(child_ids(child, False))
    return ids


def calculate_path_for_hierarchy_roots(hierarchies: List[Hierarchy]):
    for hierarchy in hierarchies:
        calculate_path_for_hierarchy_root(hierarchy)


def calculate_path_for_hierarchy_root(hierarchy: Hierarchy):
    if not hierarchy.path:
        hierarchy = find_root_parent(hierarchy)
        logger.debug(
            "Calculating hierarchy paths for {} and descendants.",
            hierarchy.taxon_name.scientific_name,
        )
        hierarchy.path = Ltree(str(hierarchy.classification_system_id)) + Ltree(
            strip_space(hierarchy.taxon_name.canonical_name)
        )
        hierarchy.session.add(hierarchy)
        calculate_path_for_children(hierarchy)


def calculate_path_for_children(hierarchy: Hierarchy):
    for child in hierarchy.direct_children:
        if not child.path:
            child.path = hierarchy.path + Ltree(
                strip_space(child.taxon_name.canonical_name)
            )
            child.session.add(child)
            calculate_path_for_children(child)


if __name__ == "__main__":
    rebuild_hierarchy_paths(get_db().__next__())
