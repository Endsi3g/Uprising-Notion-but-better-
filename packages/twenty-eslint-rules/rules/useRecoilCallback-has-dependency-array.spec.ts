import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './useRecoilCallback-has-dependency-array';

const ruleTester = new TSESLint.RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
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

