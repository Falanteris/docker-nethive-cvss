FROM node:lts

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN apt-get update

RUN apt-get upgrade --assume-yes

RUN apt-get install python3-pip --assume-yes

RUN add-apt-repository ppa:deadsnakes/ppa && apt update && apt install python3.9

RUN pip3 install --upgrade pip setuptools

RUN pip3 install -r requirements.txt

RUN apt-get install -y curl

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
