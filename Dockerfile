
FROM denoland/deno:1.16.0

EXPOSE 8000

WORKDIR /app

COPY deps.ts .
COPY . .

RUN deno cache deps.ts
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-write", "--allow-read", "main.ts"]