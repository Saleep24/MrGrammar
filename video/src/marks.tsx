// Brand marks copied from the symbol defs in site/index.html
import React from 'react';
export const marks: {name: string; inner: string}[] = [
  {name: 'Gmail', inner: '<path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>'},
  {name: 'Outlook', inner: '<rect width="24" height="24" rx="6" fill="#0F6CBD"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#fff" stroke-width="3"/>'},
  {name: 'Slack', inner: '<rect x="6.5" y="1" width="4" height="11" rx="2" fill="#36C5F0"/><rect x="1" y="8" width="4" height="4" rx="2" fill="#36C5F0"/><rect x="12" y="6.5" width="11" height="4" rx="2" fill="#2EB67D"/><rect x="12" y="1" width="4" height="4" rx="2" fill="#2EB67D"/><rect x="13.5" y="12" width="4" height="11" rx="2" fill="#ECB22E"/><rect x="19" y="12" width="4" height="4" rx="2" fill="#ECB22E"/><rect x="1" y="13.5" width="11" height="4" rx="2" fill="#E01E5A"/><rect x="8" y="19" width="4" height="4" rx="2" fill="#E01E5A"/>'},
  {name: 'LinkedIn', inner: '<rect width="24" height="24" rx="4" fill="#0A66C2"/><text x="12" y="17.5" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="13" fill="#fff">in</text>'},
  {name: 'Facebook', inner: '<path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>'},
  {name: 'Messenger', inner: '<path fill="#0084FF" d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13"/>'},
];
export const Mark: React.FC<{inner: string; size: number}> = ({inner, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" dangerouslySetInnerHTML={{__html: inner}} />
);
