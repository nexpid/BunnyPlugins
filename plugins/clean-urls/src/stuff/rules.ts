// copied from https://github.com/Vendicated/Vencord/blob/main/src/plugins/clearURLs/defaultRules.ts
const defaultRules = [
  "action_object_map",
  "action_type_map",
  "action_ref_map",
  "spm@*.aliexpress.com",
  "scm@*.aliexpress.com",
  "aff_platform",
  "aff_trace_key",
  "algo_expid@*.aliexpress.*",
  "algo_pvid@*.aliexpress.*",
  "btsid",
  "ws_ab_test",
  "pd_rd_*@amazon.*",
  "_encoding@amazon.*",
  "psc@amazon.*",
  "tag@amazon.*",
  "ref_@amazon.*",
  "pf_rd_*@amazon.*",
  "pf@amazon.*",
  "crid@amazon.*",
  "keywords@amazon.*",
  "sprefix@amazon.*",
  "sr@amazon.*",
  "ie@amazon.*",
  "node@amazon.*",
  "qid@amazon.*",
  "callback@bilibili.com",
  "cvid@bing.com",
  "form@bing.com",
  "sk@bing.com",
  "sp@bing.com",
  "sc@bing.com",
  "qs@bing.com",
  "pq@bing.com",
  "sc_cid",
  "mkt_tok",
  "trk",
  "trkCampaign",
  "ga_*",
  "gclid",
  "gclsrc",
  "hmb_campaign",
  "hmb_medium",
  "hmb_source",
  "spReportId",
  "spJobID",
  "spUserID",
  "spMailingID",
  "itm_*",
  "s_cid",
  "elqTrackId",
  "elqTrack",
  "assetType",
  "assetId",
  "recipientId",
  "campaignId",
  "siteId",
  "mc_cid",
  "mc_eid",
  "pk_*",
  "sc_campaign",
  "sc_channel",
  "sc_content",
  "sc_medium",
  "sc_outcome",
  "sc_geo",
  "sc_country",
  "nr_email_referer",
  "vero_conv",
  "vero_id",
  "yclid",
  "_openstat",
  "mbid",
  "cmpid",
  "cid",
  "c_id",
  "campaign_id",
  "Campaign",
  "hash@ebay.*",
  "fb_action_ids",
  "fb_action_types",
  "fb_ref",
  "fb_source",
  "fbclid",
  "refsrc@facebook.com",
  "hrc@facebook.com",
  "gs_l",
  "gs_lcp@google.*",
  "ved@google.*",
  "ei@google.*",
  "sei@google.*",
  "gws_rd@google.*",
  "gs_gbg@google.*",
  "gs_mss@google.*",
  "gs_rn@google.*",
  "_hsenc",
  "_hsmi",
  "__hssc",
  "__hstc",
  "hsCtaTracking",
  "source@sourceforge.net",
  "position@sourceforge.net",
  "t@*.twitter.com",
  "s@*.twitter.com",
  "ref_*@*.twitter.com",
  "tt_medium",
  "tt_content",
  "lr@yandex.*",
  "redircnt@yandex.*",
  "feature@youtube.com",
  "kw@youtube.com",
  "si@youtube.com",
  "pp@youtube.com",
  "si@youtu.be",
  "wt_zmc",
  "utm_source",
  "utm_content",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "si@open.spotify.com",
  "igshid",
  "share_id@reddit.com",
];

const extraRules = [
  "ex@cdn.discordapp.com",
  "is@cdn.discordapp.com",
  "hm@cdn.discordapp.com",
  "ex@media.discordapp.net",
  "is@media.discordapp.net",
  "hm@media.discordapp.net",
  "shareKey@coolapk.com",
  "shareUid@coolapk.com",
  "shareFrom@coolapk.com",
  "si@spotify.link",
  "feature@youtu.be",
  "ref@*.nicovideo.jp",
  "cp_in@*.nicovideo.jp",
  "cmnhd_ref@*.nicovideo.jp",
  "_topic@*.nicovideo.jp",
  "via@*.nicovideo.jp",
  "at@*.nicovideo.jp",
  "state@*.nicovideo.jp",
  "_trakparams@ebay.*",
];

const reEscaper = /[\\^$.*+?()[\]{}|]/g;
const reEscape = (str: string) => str.replace(reEscaper, "\\$&");

const universal = new Array<RegExp>();
const byHost: Record<string, RegExp[]> = {};
const hostMap: Record<string, RegExp> = {};

for (const mrule of [...defaultRules, ...extraRules]) {
  const [rule, host] = mrule.split("@");
  const reRule = new RegExp(`^${reEscape(rule).replace(/\*/g, ".+?")}$`);

  if (!host) {
    universal.push(reRule);
    continue;
  }

  const reHost = new RegExp(
    `^(?:www\\.)?${reEscape(host)
      .replace(/\*\./g, "(?:.+?\\.)?")
      .replace(/\*/g, ".+?")}$`,
  );
  const reHostStr = reHost.toString();

  hostMap[reHostStr] = reHost;
  byHost[reHostStr] ??= [];
  byHost[reHostStr].push(reRule);
}

export default { universal, byHost, hostMap };
