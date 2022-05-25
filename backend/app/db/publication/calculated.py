def calculate_fields(mapper, connection, target):
    target.publication_date = get_publication_date(target)


def get_publication_date(target):
    vals = [target.publication_day, target.publication_month, target.publication_year]
    if all(vals):
        return "/".join(map(str, vals))
    return ""
