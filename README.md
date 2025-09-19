<p align="center"><a href="https://juvenotes.com" target="_blank"><img src="https://i.imgur.com/HGxq8Db.png" width="400" alt="logo"></a><p>

<p align="center">
<a href="#"><img src="https://img.shields.io/badge/students-13K-blue" alt="Total Users"></a>
<a href="LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

# Juvenotes Open-Source Web Application

Open-source web app for affordable, high-quality medical education tailored to local needs. Empowering students to excel in their academic journey. Join us in transforming medical learning!

_Empowering medical students with open-source, locally-tailored educational tools._

## About

Juvenotes-Current is a web application designed to bridge gaps in medical education by providing affordable, high-quality study resources. Built for students, by students—with a focus on local relevance and accessibility.

**Tech Stack**:

- **Backend**: AdonisJS (TypeScript)
- **Frontend**: Vue.js
- **Database**: PostgreSQL
- **Infrastructure**: Docker

## Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL
- Docker (optional)

### With Docker (Recommended)

```bash
git clone https://github.com/juvenotes/web.git
cd web
cp .env.example .env  # Update variables
docker build -t juvenotes .
docker-compose up -d
```

## Local Setup

- Clone the repo and install dependencies:

```bash
pnpm install
```

- Configure .env (use .env.example as a template).

- Run migrations and start the server:

```bash
node ace migration:run
node ace serve --watch
```

- Access the app at http://localhost:3333.

## Project Structure

```
text
web/
├── app/               # AdonisJS backend
├── resources/         # Vue.js frontend
├── database/          # PostgreSQL migrations
├── Dockerfile         # Multi-stage build
└── docker-compose.yml # Local development
```

## How to Contribute

See [Contribution Guidline](CONTRIBUTING.md) for guidelines.

## License

The Juvenotes Web Application is open-sourced software licensed under the [GPL license](LICENSE.md).
