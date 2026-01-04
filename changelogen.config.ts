export default {
  output: 'CHANGELOG.md',
  types: {
    feat: { title: '✨ Features' },
    fix: { title: '🐛 Bug Fixes' },
    perf: { title: '⚡ Performance' },
    refactor: { title: '♻️ Refactors' },
    docs: { title: '📝 Documentation' },
    chore: { title: '🏠 Chores' },
    test: { title: '✅ Tests' },
    style: { title: '🎨 Styles' },
    ci: { title: '👷 CI' },
  },
  excludeAuthors: [],
  repo: {
    type: 'github',
    repo: 'anthropics/must',
  },
};

