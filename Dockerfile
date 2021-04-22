FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN apk update

RUN apk upgrade

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN apk add curl

RUN npm install

RUN npm install -g forever

RUN chmod +x start-service

RUN chmod +x auto_merge

RUN mkdir "gzdata" "data_feeds"

RUN cd tests && \
    pip3 install -r requirements.txt && \
    py.test unit_tests.py -s -k merge

RUN mkdir "/var/nethive"

RUN touch "/var/nethive/config.json"

RUN node prebuild-meta.js

RUN node prebuild-integration.js

RUN ./auto_merge 

ENV PRODUCER=NETHIVES

ENV BOOTSTRAP_SERVER=localhost:9092

ENV NETHIVE_SECRET=secret

ENV ESLOC=http://elastic:changeme@localhost:9200

ENV STOREINDEX=nethive-cvss

ENTRYPOINT ["bash","start-service"]


