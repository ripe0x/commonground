FROM node:22-slim

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json tsconfig.json ./

# Copy ALL workspace package.json files (including web — needed for npm workspace resolution)
COPY packages/abi/package.json packages/abi/package.json
COPY packages/addresses/package.json packages/addresses/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/indexer/package.json apps/indexer/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

# Fix React 18/19 conflict: npm hoists React 19 (from web) to root, but
# ink + react-reconciler (used by Ponder) need React 18 internals.
# Force-install React 18 nested under ink so its require('react') resolves correctly.
RUN mkdir -p node_modules/ink/node_modules \
 && cd /tmp \
 && npm pack react@18.3.1 --pack-destination . \
 && npm pack scheduler@0.23.2 --pack-destination . \
 && mkdir -p /app/node_modules/ink/node_modules/react \
 && tar xzf react-18.3.1.tgz -C /app/node_modules/ink/node_modules/react --strip-components=1 \
 && mkdir -p /app/node_modules/ink/node_modules/scheduler \
 && tar xzf scheduler-0.23.2.tgz -C /app/node_modules/ink/node_modules/scheduler --strip-components=1 \
 && rm -rf /tmp/*.tgz

# Copy source files (web source excluded via .dockerignore)
COPY packages/abi/src packages/abi/src
COPY packages/addresses/src packages/addresses/src
COPY packages/shared/src packages/shared/src
COPY apps/indexer/ apps/indexer/

WORKDIR /app/apps/indexer

EXPOSE 42069

CMD ["npm", "run", "start"]
