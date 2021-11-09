# publish
Notion DB integration for LAHS GET

Enables non-technical publishing and content management for LAHS GET.

## Deployment
```bash
docker build -t publish .
docker run -p 8000:8000 --rm --name publish -d publish
```
