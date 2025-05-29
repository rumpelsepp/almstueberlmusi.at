deploy:
    hugo && rsync -avz --delete public/ deploy@almstueberlmusi.at:/srv/http/deploy/almstueberlmusi.at

update-events:
    ./scripts/dump-events.py > content/veranstaltungen.md
