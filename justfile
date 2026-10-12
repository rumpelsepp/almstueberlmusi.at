hugo := "./themes/bienensteff/scripts/hugo"

npm-build *args:
    npm run build -- {{ args }}

# --gc drops image variants nothing references any more from resources/_gen
build: clean npm-build
    {{ hugo }} build --gc

serve: (npm-build "--sourcemap")
    {{ hugo }} server --buildDrafts --disableFastRender

deploy: build
    rsync -avz --delete public/ deploy@almstueberlmusi.at:/srv/http/deploy/almstueberlmusi.at

clean:
    rm -rf public

podman-pull:
    podman pull ghcr.io/gohugoio/hugo:latest

update-events:
    ./scripts/update-events.py > data/events.json
