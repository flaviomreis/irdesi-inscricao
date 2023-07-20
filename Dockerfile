FROM node:18-alpine AS deps
#RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src
COPY prisma/ ./prisma
COPY public/ ./public
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
ENV NODE_ENV production
ENV PORT 3000
cmd ["npm", "start"]
