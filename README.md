# Github project automation

This tiny utility automatically moves cards from `Done` to `Production` on Github Projects when the project is deployed.

## Setup

In the `.env` file add your ![personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) like this:

```
GITHUB_KEY=HERE_GOES_YOUR_ACCESS_TOKEN
```

Then setup a webhook for the deployment event and point it at the location where the server is hosted, the route should be `/deployed`
