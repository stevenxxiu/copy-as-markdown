// Convert browser items (tabs / window / etc.) to Markdown
import * as Markdown from './markdown.js';

const tabsToResult = {
  link: (tabs, options) => Markdown.links(tabs, options),
  title: (tabs /* , options */) => Markdown.list(tabs.map((tab) => tab.title)),
  url: (tabs /* , options */) => Markdown.list(tabs.map((tab) => tab.url)),
};

/**
 *
 * @param info {chrome.contextMenus.OnClickData}
 * @returns {string}
 */
export function onClickLink(info) {
  // auto discover image
  let linkText;
  let needEscape;

  if (info.mediaType === 'image') {
    needEscape = false;
    linkText = Markdown.imageFor('', info.srcUrl);
  } else {
    needEscape = true;
    // linkText for Firefox (as of 2018/03/07)
    // selectionText for Chrome on Mac only. On Windows it does not highlight text when right-click.
    // TODO: use linkText when Chrome supports it on stable.
    linkText = info.selectionText ? info.selectionText : info.linkText;
  }

  return Markdown.linkTo(linkText, info.linkUrl, { needEscape });
}

export async function currentTab(options = {}) {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
  const onlyOneTab = tabs[0];
  return Markdown.linkTo(onlyOneTab.title, onlyOneTab.url, options);
}

export async function allTabs(contentType, options = {}) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabsToResult[contentType](tabs, options);
}

export async function highlightedTabs(contentType, options = {}) {
  const tabs = await chrome.tabs.query({ currentWindow: true, highlighted: true });
  return tabsToResult[contentType](tabs, options);
}

export async function handleExport(action) {
  switch (action) {
    case 'current-tab-link': {
      return currentTab();
    }

    case 'all-tabs-link-as-list': {
      return allTabs('link');
    }

    case 'all-tabs-title-as-list': {
      return allTabs('title');
    }

    case 'all-tabs-url-as-list': {
      return allTabs('url');
    }

    case 'highlighted-tabs-link-as-list': {
      return highlightedTabs('link');
    }

    case 'highlighted-tabs-title-as-list': {
      return highlightedTabs('title');
    }

    case 'highlighted-tabs-url-as-list': {
      return highlightedTabs('url');
    }

    default: {
      throw new TypeError(`Unknown action: ${action}`);
    }
  }
}
