FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN apk update

RUN apk upgrade --assume-yes

RUN apk add python3.9 python3-pip --assume-yes

RUN pip3 install --upgrade pip setuptools

RUN pip3 install -r requirements.txt

RUN apk add -y curl

RUN npm install
a
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


