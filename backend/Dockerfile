FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

COPY src ./src

RUN npm run build
RUN npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/server.js"]
