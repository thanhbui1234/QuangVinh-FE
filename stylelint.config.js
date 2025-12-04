module.exports = {
  extends: [
    'stylelint-config-standard', // bộ rule chuẩn cho CSS
    'stylelint-config-tailwindcss', // thêm rule để hiểu Tailwind
  ],
  rules: {
    // Allow Tailwind CSS at-rules (v4)
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer', 'theme', 'custom-variant', 'config'],
      },
    ],
  },
}
