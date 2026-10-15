const getEventData = require('getEventData');
const getAllEventData = require('getAllEventData');
const getCookieValues = require('getCookieValues');
const decodeUriComponent = require('decodeUriComponent');
const setCookie = require('setCookie');
const parseUrl = require('parseUrl');
const makeString = require('makeString');

/*==============================================================================
==============================================================================*/

const eventData = getAllEventData();

if (!isConsentGivenOrNotRequired(data, eventData)) {
  return data.gtmOnSuccess();
}

const parsedUrl = parseUrl(
  data.urlSource === 'page_location_default' ? getEventData('page_location') : data.urlSource
);

if (!parsedUrl) {
  return data.gtmOnFailure();
}

let channelFlow = getChannelFlow();

if (!channelFlow) {
  return data.gtmOnFailure();
}

const cookieOptions = {
  domain: 'auto',
  path: '/',
  samesite: 'Lax',
  secure: true,
  httpOnly: false
};
if (data.cookieTime > 0) cookieOptions['max-age'] = data.cookieTime;

const noEncodeCookie = !!data.noEncodeCookie;

setCookie('channel_flow', channelFlow, cookieOptions, noEncodeCookie);
setCookie(
  'channel_flow_first',
  getFirstChannelFromChannelFlow(channelFlow),
  cookieOptions,
  noEncodeCookie
);
setCookie(
  'channel_flow_last',
  getLastChannelFromChannelFlow(channelFlow),
  cookieOptions,
  noEncodeCookie
);

if (data.storeFirstUTM) storeFirstUTM();
if (data.storeLastUTM) storeLastUTM();

return data.gtmOnSuccess();

/*==============================================================================
Helpers
==============================================================================*/

function getChannelFlow() {
  const channelFlowCookie = getCookieValue('channel_flow');
  const currentChannel = getCurrentChannel();

  if (!channelFlowCookie) {
    return currentChannel;
  }

  if (currentChannel === 'direct/none' || currentChannel === '') {
    return channelFlowCookie;
  }

  const channelFlowLastCookie = getCookieValue('channel_flow_last');

  if (currentChannel === channelFlowLastCookie) {
    return channelFlowCookie;
  }

  return channelFlowCookie + ',' + currentChannel;
}

function getCookieValue(name) {
  const value = getCookieValues(name, true)[0];
  if (!value) return value;
  // Cookies stored unencoded by older versions may contain a literal '%' that can't be decoded.
  return decodeUriComponent(value) || value;
}

function getCurrentChannel() {
  const utmSource = parsedUrl.searchParams.utm_source;
  const utmMedium = parsedUrl.searchParams.utm_medium;

  if (utmSource || utmMedium) {
    return (utmSource ? utmSource : 'direct') + '/' + (utmMedium ? utmMedium : 'none');
  }

  const parsedReferrer = parseUrl(
    data.referrerSource === 'page_referrer_default'
      ? getEventData('page_referrer')
      : data.referrerSource
  );

  if (!parsedReferrer) {
    return 'direct/none';
  }

  const referrerHostname = parsedReferrer.hostname;

  if (
    referrerHostname &&
    data.ignoreReferrerExpression &&
    referrerHostname.match(data.ignoreReferrerExpression)
  ) {
    return '';
  }

  if (referrerHostname === parsedUrl.hostname) {
    return 'direct/none';
  }

  if (
    referrerHostname &&
    data.searchEngineExpression &&
    referrerHostname.match(data.searchEngineExpression)
  ) {
    const referrerHostnameParts = referrerHostname.replace('www.', '').split('.');
    return referrerHostnameParts[0] + '/organic';
  }

  if (
    referrerHostname &&
    data.excludeReferrerExpression &&
    referrerHostname.match(data.excludeReferrerExpression)
  ) {
    return 'direct/none';
  }

  return referrerHostname + '/referral';
}

function getLastChannelFromChannelFlow(channelFlow) {
  let channels = channelFlow.split(',');

  return channels[channels.length - 1];
}

function getFirstChannelFromChannelFlow(channelFlow) {
  let channels = channelFlow.split(',');

  return channels[0];
}

function storeFirstUTM() {
  if (
    !getCookieValue('utm_source_first') &&
    !getCookieValue('utm_medium_first') &&
    !getCookieValue('utm_campaign_first') &&
    !getCookieValue('utm_content_first') &&
    !getCookieValue('utm_term_first') &&
    (parsedUrl.searchParams.utm_source ||
      parsedUrl.searchParams.utm_medium ||
      parsedUrl.searchParams.utm_campaign ||
      parsedUrl.searchParams.utm_content ||
      parsedUrl.searchParams.utm_term)
  ) {
    setCookie(
      'utm_source_first',
      parsedUrl.searchParams.utm_source ? makeString(parsedUrl.searchParams.utm_source) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_medium_first',
      parsedUrl.searchParams.utm_medium ? makeString(parsedUrl.searchParams.utm_medium) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_campaign_first',
      parsedUrl.searchParams.utm_campaign ? makeString(parsedUrl.searchParams.utm_campaign) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_content_first',
      parsedUrl.searchParams.utm_content ? makeString(parsedUrl.searchParams.utm_content) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_term_first',
      parsedUrl.searchParams.utm_term ? makeString(parsedUrl.searchParams.utm_term) : '',
      cookieOptions,
      noEncodeCookie
    );
  }
}

function storeLastUTM() {
  if (
    parsedUrl.searchParams.utm_source ||
    parsedUrl.searchParams.utm_medium ||
    parsedUrl.searchParams.utm_campaign ||
    parsedUrl.searchParams.utm_content ||
    parsedUrl.searchParams.utm_term
  ) {
    setCookie(
      'utm_source',
      parsedUrl.searchParams.utm_source ? makeString(parsedUrl.searchParams.utm_source) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_medium',
      parsedUrl.searchParams.utm_medium ? makeString(parsedUrl.searchParams.utm_medium) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_campaign',
      parsedUrl.searchParams.utm_campaign ? makeString(parsedUrl.searchParams.utm_campaign) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_content',
      parsedUrl.searchParams.utm_content ? makeString(parsedUrl.searchParams.utm_content) : '',
      cookieOptions,
      noEncodeCookie
    );
    setCookie(
      'utm_term',
      parsedUrl.searchParams.utm_term ? makeString(parsedUrl.searchParams.utm_term) : '',
      cookieOptions,
      noEncodeCookie
    );
  }
}

function isConsentGivenOrNotRequired(data, eventData) {
  if (data.consent !== 'required') return true;

  if (eventData.consent_state) {
    return data.consentStatusParameters.every((d) => !!eventData.consent_state[d.parameter]);
  }

  const gcsPositionMapping = { analytics_storage: 3, ad_storage: 2 };
  const xGaGcs = eventData['x-ga-gcs'] || ''; // x-ga-gcs is a string like "G110"
  return data.consentStatusParameters.every((d) => xGaGcs[gcsPositionMapping[d.parameter]] === '1');
}
