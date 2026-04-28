# Jazzmin Settings - Professional Admin UI
JAZZMIN_SETTINGS = {
    # Site branding
    "site_title": "GradBridge Admin",
    "site_header": "GradBridge",
    "site_brand": "GradBridge Admin Panel",
    "site_logo": None,  # Path to logo image in static files
    "login_logo": None,
    "site_icon": None,  # Favicon path
    "welcome_sign": "Welcome to GradBridge Admin",
    "copyright": "GradBridge © 2024",
    
    # Search model in admin
    "search_model": ["accounts.User", "profiles.StudentProfile", "profiles.AlumniProfile"],
    
    # User menu (top right)
    "user_avatar": None,
    
    # Top menu links
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site", "url": "/", "new_window": True},
        {"model": "accounts.User"},
    ],
    
    # Side menu
    "usermenu_links": [
        {"model": "accounts.user"},
    ],
    
    # Show/hide apps and models in the side menu
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    
    # Order of apps and models in the side menu
    "order_with_respect_to": [
        "accounts",
        "profiles",
        "projects",
        "mentorship",
        "community",
        "chat",
        "notifications",
    ],
    
    # Custom model icons (Font Awesome 5)
    "icons": {
        "accounts.User": "fas fa-user",
        "profiles.StudentProfile": "fas fa-user-graduate",
        "profiles.AlumniProfile": "fas fa-user-tie",
        "profiles.Skill": "fas fa-tag",
        "profiles.Certificate": "fas fa-certificate",
        "projects.Project": "fas fa-project-diagram",
        "mentorship.MentorshipRequest": "fas fa-hands-helping",
        "mentorship.ReferralRequest": "fas fa-share-square",
        "community.Post": "fas fa-comments",
        "chat.Conversation": "fas fa-comment-dots",
        "chat.Message": "fas fa-envelope",
        "notifications.Notification": "fas fa-bell",
        "auth.Group": "fas fa-users",
    },
    
    # Related modal (for foreign keys)
    "related_modal_active": True,
    
    # UI Tweaks
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    
    # Change view settings
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "accounts.user": "collapsible",
        "profiles.studentprofile": "vertical_tabs",
    },
    
    # Theme (darkly, flatly, etc.)
    "theme": "darkly",  # Professional dark theme
    
    # Language
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark navbar-primary",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": True,
    "theme": "darkly",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}
