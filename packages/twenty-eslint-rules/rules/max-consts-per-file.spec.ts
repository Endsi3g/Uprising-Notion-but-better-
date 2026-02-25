import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './max-consts-per-file';

const max = 1;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      warnOnUnsupportedTypeScriptVersion: false,
    },
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const A = 1;',
      options: [{ max }],
    },
  ],
  invalid: [
    {
      code: 'const NAME_A = 1;\nconst NAME_B = 2;',
      options: [{ max }],
      errors: [{ messageId: 'tooManyConstants', data: { max } }],
    },
  ],
});
