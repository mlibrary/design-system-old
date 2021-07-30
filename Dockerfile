FROM node:14.17.3
ARG UNAME=app
ARG UID=1000
ARG GID=1000

LABEL maintainer="mrio@umich.edu"

RUN apt-get update -yqq && apt-get install -yqq --no-install-recommends \
  vim


RUN groupadd -g ${GID} -o ${UNAME}
RUN useradd -m -d /app -u ${UID} -g ${GID} -o -s /bin/bash ${UNAME}

COPY --chown=${UID}:${GID} package.json package-lock.json  /app/
USER $UNAME

WORKDIR /app
RUN npm install

COPY --chown=${UID}:${GID} . /app

RUN npm run build
