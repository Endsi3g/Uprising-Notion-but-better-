import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './use-getLoadable-and-getValue-to-get-atoms';


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
      code: 'const atoms = snapshot.getLoadable(someState).getValue();',
    },
    {
      code: 'const atoms = snapshot.getLoadable(someState(viewId)).getValue();',
    },
  ],
  invalid: [
    {
      code: 'const atoms = await snapshot.getPromise(someState);',
      errors: [
        {
          messageId: 'invalidAccessorOnSnapshot',
        },
      ],
      output: [
        'const atoms = await snapshot.getLoadable(someState);',
        'const atoms =  snapshot.getLoadable(someState);',
      ],
    },
    {
      code: 'const atoms = await snapshot.getPromise(someState(viewId));',
      errors: [
        {
          messageId: 'invalidAccessorOnSnapshot',
        },
      ],
      output: [
        'const atoms = await snapshot.getLoadable(someState(viewId));',
        'const atoms =  snapshot.getLoadable(someState(viewId));',
      ],
    },
    {
      code: 'const atoms = snapshot.getLoadable(someState).anotherMethod();',
      errors: [
        {
          messageId: 'invalidWayToGetAtoms',
        },
      ],
      output: 'const atoms = snapshot.getLoadable(someState).getValue();',
    },
  ],
});
