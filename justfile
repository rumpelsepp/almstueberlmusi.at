# The recipes every site shares (npm-build, build, serve, clean,
# podman-pull, check-links); a recipe below under the same name replaces
# the theme's.
import 'themes/bienensteff/justfile'

# For the recipes here that replace one of the theme's.
set allow-duplicate-recipes

# List all recipes
default:
    @just --list --unsorted

serve: (npm-build "--sourcemap")
    {{ hugo }} server --buildDrafts --disableFastRender

deploy: build
    rsync -avz --delete public/ deploy@almstueberlmusi.at:.

update-events:
    ./scripts/update-events.py > data/events.json
