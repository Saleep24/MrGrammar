window.chrome = {
  runtime: { getManifest: () => ({ version: '3.1' }), openOptionsPage() {} },
  tabs: { create() {} },
  commands: { getAll: async () => [{ name: 'fix-grammar', shortcut: navigator.platform.startsWith('Mac') ? '⌘⇧E' : 'Ctrl+Shift+E' }] },
  storage: { local: {
    get: (keys, cb) => { const r = { grammarStats: { totalCorrections: 1284, wordsCorrected: 31907 } }; if (cb) cb(r); return Promise.resolve(r); },
    remove: (k, cb) => cb && cb()
  } }
};
window.fetch = async () => ({ ok: true, json: async () => ({}) });
