# Homepage of Almstüberl Musi

## Update Events

1. Edit `termine.xlsx`
2. Run `just update-events`
3. Commit and push

## Develop locally

```
$ npm ci
$ just serve
```

`just` uses the locally installed `hugo`; set `USE_PODMAN=1` to run it from
the official container image instead (see `scripts/hugo`).
