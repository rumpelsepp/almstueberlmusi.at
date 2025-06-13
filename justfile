build: clean
    npm run build
    podman run \
        --net=none \
        --rm \
        --interactive \
        --tty \
        --volume "$PWD:/mnt/$PWD" \
        --workdir "/mnt/$PWD" \
        --userns keep-id \
        --group-add keep-groups \
        --log-driver none \
        ghcr.io/gohugoio/hugo:latest \
        build \
        --ignoreCache

deploy: build
    rsync -avz --delete public/ deploy@almstueberlmusi.at:/srv/http/deploy/almstueberlmusi.at

serve: clean
    podman run \
       --net=host \
       --rm \
       --interactive \
       --tty \
       --volume "$PWD:/mnt/$PWD" \
       --workdir "/mnt/$PWD" \
       --userns keep-id \
       --group-add keep-groups \
       --log-driver none \
       ghcr.io/gohugoio/hugo:latest \
       server \
       --ignoreCache \
       --disableFastRender

clean:
    rm -rf public

podman-pull:
    podman pull ghcr.io/gohugoio/hugo:latest

update-events:
    ./scripts/update-events.py > content/veranstaltungen.md
