# Channel Flow tag for Google Tag Manager Server Side

Channel flow tag for the Google Tag Manager server container stores the source/medium of users' first interaction, last one, and all in between interactions in cookies.

## Cookie names of Channel Flow tag:

- *channel_flow* - records the source/medium flow of all user interactions with the site
- *channel_flow_first* - records the first source/medium
- *channel_flow_last* - records the last source/medium

Optionally, the tag can also store UTM parameters:

- *utm_source_first*, *utm_medium_first*, *utm_campaign_first*, *utm_content_first*, *utm_term_first* - first occurred UTM parameters
- *utm_source*, *utm_medium*, *utm_campaign*, *utm_content*, *utm_term* - last occurred UTM parameters

## Cookie encoding

Cookie values are URI-encoded by default (e.g. `google/organic,facebook/cpc` is stored as `google%2Forganic%2Cfacebook%2Fcpc`). Decode them (e.g. with `decodeURIComponent`) when reading them outside of this tag.

To store raw, unencoded values instead, enable **Do not encode cookie values**. Previous versions of this tag stored cookies unencoded, so enable this option if you need to keep that behavior.

### Useful Resources
- [Track users first last source medium using server Google Tag Manager](https://stape.io/blog/track-users-first-last-source-medium-using-server-google-tag-manager)


## Open Source

Channel Flow Tag for GTM Server Side is developed and maintained by [Stape Team](https://stape.io/) under the Apache 2.0 license.

### GTM Gallery Status
🟢 [Listed](https://tagmanager.google.com/gallery/#/owners/stape-io/templates/channel-flow-tag)
