const getEventData = require('getEventData');
const getCookieValues = require('getCookieValues');
const setCookie = require('setCookie');
const parseUrl = require('parseUrl');
const makeString = require('makeString');

const parsedUrl = parseUrl(data.urlSource === 'page_location_default' ? getEventData('page_location') : data.urlSource);

if (!parsedUrl) {
    data.gtmOnFailure();

    return;
}

let channelFlow = getChannelFlow();

if (!channelFlow) {
    data.gtmOnFailure();

    return;
}

const cookieOptions = {
    domain: 'auto',
    path: '/',
    samesite: 'Lax',
    secure: true,
    httpOnly: false
};

if (data.cookieTime > 0) cookieOptions['max-age'] = data.cookieTime;

setCookie('channel_flow', channelFlow, cookieOptions, true);
setCookie('channel_flow_first', getFirstChannelFromChannelFlow(channelFlow), cookieOptions, true);
setCookie('channel_flow_last', getLastChannelFromChannelFlow(channelFlow), cookieOptions, true);

if (data.storeFirstUTM) storeFirstUTM();
if (data.storeLastUTM) storeLastUTM();

data.gtmOnSuccess();


function getChannelFlow() {
    const channelFlowCookie = getCookieValues('channel_flow')[0];
    const currentChannel = getCurrentChannel();

    if (!channelFlowCookie) {
        return currentChannel;
    }

    if (currentChannel === 'direct/none') {
        return channelFlowCookie;
    }

    const channelFlowLastCookie = getCookieValues('channel_flow_last')[0];

    if (currentChannel === channelFlowLastCookie) {
        return channelFlowCookie;
    }

    return channelFlowCookie + ',' + currentChannel;
}

function getCurrentChannel() {
    const utmSource = parsedUrl.searchParams.utm_source;
    const utmMedium = parsedUrl.searchParams.utm_medium;

    if (utmSource || utmMedium) {
        return (utmSource ? utmSource : 'direct') + '/' + (utmMedium ? utmMedium : 'none');
    }

    const parsedReferrer = parseUrl(data.referrerSource === 'page_referrer_default' ? getEventData('page_referrer') : data.referrerSource);

    if (!parsedReferrer) {
        return 'direct/none';
    }

    const referrerHostname = parsedReferrer.hostname;

    if (referrerHostname === parsedUrl.hostname) {
        return 'direct/none';
    }

    if (referrerHostname && data.searchEngineExpression && referrerHostname.match(data.searchEngineExpression)) {
        const referrerHostnameParts = referrerHostname.replace('www.', '').split('.');
        return referrerHostnameParts[0] + '/organic';
    }

    if (referrerHostname && data.excludeReferrerExpression && referrerHostname.match(data.excludeReferrerExpression)) {
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
        !getCookieValues('utm_source_first')[0]
        && !getCookieValues('utm_medium_first')[0]
        && !getCookieValues('utm_campaign_first')[0]
        && !getCookieValues('utm_content_first')[0] && !getCookieValues('utm_term_first')[0]
        && (
            parsedUrl.searchParams.utm_source
            || parsedUrl.searchParams.utm_medium
            || parsedUrl.searchParams.utm_campaign
            || parsedUrl.searchParams.utm_content
            || parsedUrl.searchParams.utm_term
        )
    ) {
        setCookie('utm_source_first', parsedUrl.searchParams.utm_source ? makeString(parsedUrl.searchParams.utm_source) : '', cookieOptions, true);
        setCookie('utm_medium_first', parsedUrl.searchParams.utm_medium ? makeString(parsedUrl.searchParams.utm_medium) : '', cookieOptions, true);
        setCookie('utm_campaign_first', parsedUrl.searchParams.utm_campaign ? makeString(parsedUrl.searchParams.utm_campaign) : '', cookieOptions, true);
        setCookie('utm_content_first', parsedUrl.searchParams.utm_content ? makeString(parsedUrl.searchParams.utm_content) : '', cookieOptions, true);
        setCookie('utm_term_first', parsedUrl.searchParams.utm_term ? makeString(parsedUrl.searchParams.utm_term) : '', cookieOptions, true);
    }
}

function storeLastUTM() {
    if (
        parsedUrl.searchParams.utm_source
        || parsedUrl.searchParams.utm_medium
        || parsedUrl.searchParams.utm_campaign
        || parsedUrl.searchParams.utm_content
        || parsedUrl.searchParams.utm_term
    ) {
        setCookie('utm_source', parsedUrl.searchParams.utm_source ? makeString(parsedUrl.searchParams.utm_source) : '', cookieOptions, true);
        setCookie('utm_medium', parsedUrl.searchParams.utm_medium ? makeString(parsedUrl.searchParams.utm_medium) : '', cookieOptions, true);
        setCookie('utm_campaign', parsedUrl.searchParams.utm_campaign ? makeString(parsedUrl.searchParams.utm_campaign) : '', cookieOptions, true);
        setCookie('utm_content', parsedUrl.searchParams.utm_content ? makeString(parsedUrl.searchParams.utm_content) : '', cookieOptions, true);
        setCookie('utm_term', parsedUrl.searchParams.utm_term ? makeString(parsedUrl.searchParams.utm_term) : '', cookieOptions, true);
    }
}
