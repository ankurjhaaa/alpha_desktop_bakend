# Workspace Rules

- **Do NOT run `php artisan migrate:fresh` under any circumstances** to prevent losing database data. Always use standard migrations or modify/run specific operations carefully without wiping the database.
- **Strictly match the existing design language and style system** (Tailwind CSS v4.0 + CSS variable themes in `themes.css`). When adding or modifying UI components, ensure they blend seamlessly with the pre-existing design, elements, colors, and layout structure of the application.
