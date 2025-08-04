FROM node:latest

COPY . /app

RUN <<EOF
cd /app
rm /app/node_modules
rm /app/package-lock.json
npm install
npm run build
EOF

CMD cd /app ; npm run start
