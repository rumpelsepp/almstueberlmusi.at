#!/usr/bin/env bash

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
   ghcr.io/gohugoio/hugo:latest "$@"
