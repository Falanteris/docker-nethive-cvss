FROM python:alpine

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN apk update

RUN apk upgrade

RUN apk add bash

RUN apk add libc6-compat

RUN apk add --update npm

RUN apk add --no-cache --virtual .build-deps g++ python3-dev libffi-dev openssl-dev && \
    apk add --no-cache --update python3 && \
    pip3 install --upgrade pip setuptools && \
    pip3 install numpy && \
    pip3 install pandas && \ 
    pip3 install kafka-python && \
    pip3 install cvss
	
RUN npm install

RUN npm install -g forever

RUN chmod +x start-service

RUN mkdir "gzdata" "data_feeds"

ENTRYPOINT ["bash","start-service"]


