FROM node:5.11
MAINTAINER Gideon Thomas <gideon@mozillafoundation.org>

WORKDIR /brackets
COPY . /brackets/
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install
EXPOSE 8000
CMD npm start
