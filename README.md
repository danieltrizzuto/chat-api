<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

## Description

Chat API

### Regular post:

1. `createPost` Mutation emits a `new.post.requested` message to `posts` queue at RabbitMQ and returns `success: true` to the client;
2. `new.post.requested` consumer emits a `new.post.accepted` with post params (author, body, roomId and userId);
3. `new.post.accepted` consumer creates the post at the DB and emits a `new.post.created` message at a `fanout` RabbitMQ exchange (Pub/Sub) making sure all running server instances receive it;
4. The `postCreated` Subscription is listening for `new.post.created` messages and when a new message is consumed, the connected clients that are listening to the correspondent roomId are notified of a new message via the WebSocket connection.

### Bot post (no error occcurred within the bot:

1. `createPost` Mutation emits a `new.post.requested` message to `posts` queue at RabbitMQ and returns `success: true` to the client;
2. `new.post.requested` consumer emits a `bot.command.received` with a signed JWT that is valid for only 5 minutes and the post params (`author, body, roomId and userId`);
3. The Bot consumes the `bot.command.received`, calls the Stooq API and if the processing is successfull and data is valid, the bot emits a message with the formatted post params to `bot.post.request`;
4. The `bot.post.request` consumer validates the data, and if everything is fine, emits a message to `new.post.accepted` with post params (`author, body, roomId and userId`);
5. `new.post.accepted` consumer creates the post at the DB and emits a `new.post.created` message at a `fanout` RabbitMQ exchange (Pub/Sub) making sure all running server instances receive it;
6. The `postCreated` Subscription is listening for `new.post.created` messages and when a new message is consumed, the connected clients that are listening to the correspondent `roomId` are notified of a new message via the WebSocket connection.

### Bot post (error occcurred within the bot):

1. `createPost` Mutation emits a `new.post.requested` message to `posts` queue at RabbitMQ and returns `success: true` to the client;
2. `new.post.requested` consumer emits a `bot.command.received` with a signed JWT that is valid for only 5 minutes and the post params (`author, body, roomId and userId`);
3. The Bot consumes the `bot.command.received`, calls the Stooq API and if the processing is not successfull or data received is not valid, the bot emits a message with the original post params to `bot.post.request` + `error=true`;
4. The `bot.post.request` consumer validates the data, and if everything is fine, but `error=true`, it emits a message to `new.post.error` with original post params (`author, body, roomId and userId`);
5. The `new.post.error` consumer emits a `new.post.error.notify` message at a `fanout` RabbitMQ exchange (Pub/Sub) making sure all running server instances receive it;
6. The `postError` Subscription is listening for `new.post.error.notify` messages and when a new message is consumed, the connected clients that are listening to the correspondent `userId` are notified of a new message via the WebSocket connection.

## Installation

```bash
$ yarn
```

## Running the app

```bash
$ yarn start
```

After running, the GraphQL Playgroung is available. Open [http://localhost:4100/graphql](http://localhost:4100/graphql) to view it in the browser after running.

## Test

```bash
# unit tests
$ yarn test

# test coverage
$ yarn test:cov
```
