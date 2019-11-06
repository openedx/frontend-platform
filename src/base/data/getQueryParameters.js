export default function getQueryParameters(search = global.location.search) {
  const keyValueFragments = search
    .slice(search.indexOf('?') + 1)
    .split('&')
    .filter(hash => hash !== '');

  return keyValueFragments.reduce((params, keyValueFragment) => {
    const split = keyValueFragment.indexOf('=');
    const key = keyValueFragment.slice(0, split);
    const value = keyValueFragment.slice(split + 1);
    return Object.assign(params, { [key]: decodeURIComponent(value) });
  }, {});
}
