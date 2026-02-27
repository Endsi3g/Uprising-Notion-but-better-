import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './useRecoilCallback-has-dependency-array';


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
      code: 'const someValue = useRecoilCallback(() => () => {}, []);',
    },
    {
      code: 'const someValue = useRecoilCallback(() => () => {}, [dependency]);',
    },
  ],
  invalid: [
    {
      code: 'const someValue = useRecoilCallback(({}) => () => {});',
      errors: [
        {
          messageId: 'isNecessaryDependencyArray',
        },
      ],
      output: 'const someValue = useRecoilCallback(({}) => () => {}, []);',
    },
  ],
});
