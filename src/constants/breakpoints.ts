/**
 * Responsive breakpoint constants
 * Centralized breakpoint management for consistent responsive design
 */

export const BREAKPOINTS = {
  XS: '480px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px',
} as const;

export const MEDIA_QUERIES = {
  XS: `@media (max-width: ${BREAKPOINTS.XS})`,
  SM: `@media (max-width: ${BREAKPOINTS.SM})`,
  MD: `@media (max-width: ${BREAKPOINTS.MD})`,
  LG: `@media (max-width: ${BREAKPOINTS.LG})`,
  XL: `@media (max-width: ${BREAKPOINTS.XL})`,
  XXL: `@media (max-width: ${BREAKPOINTS.XXL})`,
} as const;

export const CONTAINER_MAX_WIDTHS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px',
} as const;
