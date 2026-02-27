import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './no-state-useref';


// @ts-ignore
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
      code: 'const scrollableRef = useRef<HTMLDivElement>(null);',
    },
    {
      code: 'const ref = useRef<HTMLInputElement>(null);',
    },
  ],
  invalid: [
    {
      code: 'const ref = useRef(null);',
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
    },
    {
      code: 'const ref = useRef<Boolean>(null);',
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
    },
    {
      code: "const ref = useRef<string>('');",
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
    },
  ],
});
