# GitHub Client

You can see issues now.

TODO: image

## Usage

1. Clone this repository.

   ```bash
   git clone https://github.com/senkenn/github-client.git
   ```

1. Add your GitHub token to `.env`.

   ```bash
   cd github-client
   echo VITE_GITHUB_TOKEN=$(gh auth token) > .env
   ```

1. Start the server with Docker Compose.

   ```bash
   docker compose up -d
   ```

1. Access to `http://localhost:7777` with your browser.
