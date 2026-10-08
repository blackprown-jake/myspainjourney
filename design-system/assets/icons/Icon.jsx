// <Icon name="search" size={20} /> — Wanted icon set. Monochrome icons inherit `color`.
import ICONS from './icon-data.js';
export function Icon({ name, size = 20, color, className, style, ...rest }) {
  const ic = ICONS[name];
  if (!ic) return null;
  return (
    <svg width={size} height={size} viewBox={ic.viewBox} fill="none"
      className={className}
      style={{ color, display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style }}
      dangerouslySetInnerHTML={{ __html: ic.body }} aria-hidden="true" {...rest} />
  );
}
export const ICON_NAMES = ["arrow-down","arrow-left","arrow-right","arrow-up","arrow-up-right","bell","bell-fill","bell-plus","bookmark","bookmark-fill","bubble","bulb","business-bag","business-bag-fill","calendar","calendar-person","caret-down","caret-up","chat","check","chevron-down","chevron-left","chevron-right","chevron-up","circle-check","circle-close","circle-exclamation","circle-info","circle-plus","circle-question","clock","close","coins","company","copy","crown","document","document-text","download","external-link","eye","eye-slash","filter","fire","folder","globe","graduation","heart","heart-fill","home","home-fill","link","location","lock","lock-open","logo-apple","logo-facebook","logo-google","logo-instagram","logo-kakao","logo-linkedin","logo-naver","logo-x","logo-youtube","magic-wand","mail","megaphone","menu","message","minus","more-horizontal","more-vertical","pencil","person","person-fill","persons","phone","plus","refresh","search","send","setting","share","sparkle","star","star-fill","tag","thunder","trash","triangle-exclamation","tune","upload","write"];
export default Icon;
