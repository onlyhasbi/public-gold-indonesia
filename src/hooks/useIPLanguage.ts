import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useIPLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!sessionStorage.getItem('geofetch_resolved')) {
      fetch('https://get.geojs.io/v1/ip/country.json')
        .then(res => res.json())
        .then(data => {
          if (data.country === 'ID') {
             i18n.changeLanguage('id');
          } else if (data.country === 'MY' || data.country === 'BN') {
             i18n.changeLanguage('ms');
          } else if (['CN', 'TW', 'HK', 'MO', 'SG'].includes(data.country)) {
             i18n.changeLanguage('zh');
          } else if (['IN', 'LK'].includes(data.country)) {
             i18n.changeLanguage('ta');
          } else {
             // Fallback default language
             i18n.changeLanguage('en');
          }
          sessionStorage.setItem('geofetch_resolved', 'true');
        })
        .catch(console.error);
    }
  }, [i18n]);
}
