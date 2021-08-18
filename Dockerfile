FROM node:16.6
ARG UNAME=app
ARG UID=1000
ARG GID=1000

LABEL maintainer="mrio@umich.edu"

ENV NODE_AUTH_TOKEN node_auth_token

#RUN npm install -g npm@7.20.3
RUN apt-get update -yqq && apt-get install -yqq --no-install-recommends \
  vim-tiny


RUN groupadd -g ${GID} -o ${UNAME}
RUN useradd -m -d /app -u ${UID} -g ${GID} -o -s /bin/bash ${UNAME}
USER $UNAME

WORKDIR /app
