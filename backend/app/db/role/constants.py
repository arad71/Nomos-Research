class Role:
    """
    Constants for the various roles scoped in the application ecosystem
    """

    READER = {
        "name": "READER",
        "description": (
            "Default view provided to all registered users. Ability to print is part of"
            " MOMOS viewer."
        ),
    }
    OFFICER = {
        "name": "OFFICER",
        "description": (
            "Allows a user create and update Taxonomic data in the datasets they have"
            " access to - all by default, or as further specified. Requires login and"
            " OIM account."
        ),
    }
    MANAGER = {
        "name": "MANAGER",
        "description": (
            'As per "Nomos officer" but allows for soft delete , create kingdoms and'
            " other restricted reference data"
        ),
    }
    APPLICATION_SUPPORT = {
        "name": "APPLICATION_SUPPORT",
        "description": (
            "Allows a user to create, update and remove internal and external user"
            " accounts and to assign/remove user roles"
        ),
    }
    SUPER_ADMIN = {
        "name": "SUPER_ADMIN",
        "description": "Super Administrator of Application Ecosystem",
    }
    CONSERVATION_OFFICER = {
        "name": "CONSERVATION_OFFICER",
        "description": "Conservation officer of Application Ecosystem",
    }


TABLE_DESCRIPTION = "List of roles available in the system."
