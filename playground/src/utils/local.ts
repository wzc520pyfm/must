import i18n from '../i18n';

export function getLocal(key: string, defaultMessage: string) {
  return i18n.t(key, { defaultValue: defaultMessage });
}
