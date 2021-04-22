FROM node:lts

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN apt-get update

RUN apt-get upgrade --assume-yes

RUN apt-get install software-properties-common python3-pip -y
RUN wget https://www.python.org/ftp/python/3.7.3/Python-3.7.3.tar.xz && tar xf Python-3.7.3.tar.xz

RUN cd ./Python-3.7.3  && ./configure && make && make install && update-alternatives --install /usr/bin/python python /usr/local/bin/python3.7 10

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
