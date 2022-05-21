# publish
Publish is a Notion integration & server that enables publishing data-driven content by people not experienced with databases. *It's basically just a big spreadsheet*.

## What is it?
Publish downloads and caches Notion database content and serves it on it's own web server. This includes attached images. Publish will even process the images into standardized `.webp` format (600px thumbnail size and 4K large size) for efficiency.

It does not work with regular pages (markdown content). Only databases.

It uses [`notion_flatten`](https://deno.land/x/notion_flatten@v0.3.2/mod.ts)'s flattened data structure.

## Adding pages to be cached
There are two ways to ensure Publish will cache a page. One is to statically add it to the Publish cache list in `data/clubs.ts`.

The other is to add it in a database page under a column named `ID`, and adding that page's ID to the Publish `dynamicDatabase` cache list in `data/clubs.ts`.

Example:
```json
[
  {
    id: "myAwoo", // arbitrary, publish from PUBLISH.TLD/?club=myAwoo
    name: "National Art Honors Society", // also arbitrary, for vanity
    short: "nahs", // used in logging
    dynamicDatabases: [
      "1234" // Notion database ID for a database with a column called ID, with more Notion database IDs inside to be cached
    ],
    databases: [
      "5678", // Notion database ID to always cache
    ],
  }
]
```

## API
`:dbID` is the Notion page's ID. See above on how to make sure Publish caches this page.

### Cache
`publish.tld/cache/:dbID.json` - flat list of pages from the database (see notion_flatten above for exact format)
- typically, you should be querying this route and using the URLs returned inside it to access images!
- rows with files attached have additional or modified properties:
```json
{
  "type": "file",
  "name": "ABCDE.png", // new name of file
  "url": "https://db.lahs.club/view/dbID/ABCDE.webp", // 4K webp
  "id": "ABCDE", // new id of file
  "icon": "https://db.lahs.club/icon/dbID/ABCDE.webp", // 600px webp
  "original": "https://db.lahs.club/content/dbID/ABCDE.png" // originally downloaded file
}
```

### Content
`publish.tld/content/:dbID/:image` - original image downloaded from Notion, where `:image` is something like "ABCDEF.jpg"

### Icon
`publish.tld/icon/:dbID/:imageID.webp` - 600px processed thumbnail

### Meta
`publish.tld/meta/:dbID.json` - metadata about the database, including property info, last updated when, etc. (see notion_flatten for exact spec)

### View
`publish.tld/view/:dbID/:image.webp` - 4K processed image

## Deployment
It is **highly** recommended to use Docker volume/bind mounts, etc. to store the cached content in case the container is restarted.
```bash
docker build -t publish .
docker run \
  --name=publish \
  --restart=always \
  --env NOTION_TOKEN=secret_... \
  -p 8000:8000 \
  -v /root/publish/cache:/app/app/cache \
  -v /root/publish/content:/app/app/content \
  -v /root/publish/meta:/app/app/meta \
  -v /root/publish/view:/app/app/view \
  -v /root/publish/icon:/app/app/icon \
  -d \
  publish
```

## Adding the widget to Notion
1. /embed
2. https://publish.tld/?club=myAwoo (or whatever you set in clubs.ts, see above)
3. Grant access to all pages you set to cache above by inviting your integration, make sure you deployed Publish with that secret
4. Hit the Publish button on the widget
5. Win! (test `/cache/:dbID.json` to see if it's working)

## Troubleshooting

Make sure you have a valid Notion integration secret, and it's added to all databases you want to cache. Publish will throw errors if it can't access the page.

If you're running this on like, a literal potato, for very large databases this thing can take actually forever because image processing is computationally intensive. About 3GB of image files takes over an hour to process on an entry level DigitalOcean droplet. `docker stats` is useful here on the server side.

## Want to fix this mess of a README?
PR! :3

---

### LICENSE
- MIT
### OSS
- sharp (nodejs)
- deno
- oak
- nanoid
- notion_flatten